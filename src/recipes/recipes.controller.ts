import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer'; // NE iz '@nestjs/platform-express'
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
// Predpostavimo, da imaš userService, da pridobiš userja, če req.user ni celoten user
import { UsersService } from '../users/users.service';

@UseGuards(JwtAuthGuard)
@Controller('recipes')
export class RecipesController {
  constructor(
    private readonly recipesService: RecipesService,
    private readonly usersService: UsersService, // Morda potrebuješ
  ) {}

  // 1) Navaden create
  @Post()
  create(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(createRecipeDto);
  }

  // 2) Create with image + avtor
  @Post('create-with-image')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const randomName = uuidv4() + extname(file.originalname);
        callback(null, randomName);
      },
    }),
  }))
  async createWithImage(@UploadedFile() file: Express.Multer.File, @Req() req) {
    // parse polja iz formData
    const { title, description, steps, categoryId, categoryName, ingredients } = JSON.parse(req.body.jsonData);

    const createRecipeDto: CreateRecipeDto = {
      title,
      description,
      steps,
      categoryId,
      categoryName,
      ingredients,
    };

    // Pridobimo userja.
    // Če tvoj JWTStrategy vrne: req.user = { userId: 5 } => poiščemo userja v bazi
    const userId = req.user.userId;
    const author = await this.usersService.findOne(userId); // ali findById

    // Ustvarimo recept z avtorjem
    const recipe = await this.recipesService.createWithAuthor(createRecipeDto, author);

    if (file) {
      await this.recipesService.saveImage(recipe.id, file.filename);
    }

    return { message: 'Recipe created with image', recipeId: recipe.id };
  }

  @Get('top')
  getTopRecipes(@Query('limit') limit: number) {
    return this.recipesService.findTop(limit || 5);
  }

  @Get()
  findAll(@Query('categoryId') categoryId?: string) {
    if (categoryId) {
      return this.recipesService.findByCategory(Number(categoryId));
    }
    return this.recipesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto) {
    return this.recipesService.update(Number(id), updateRecipeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recipesService.remove(Number(id));
  }
}
