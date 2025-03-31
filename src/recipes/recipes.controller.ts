import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { UsersService } from '../users/users.service';

@UseGuards(JwtAuthGuard)
@Controller('recipes')
export class RecipesController {
  constructor(
    private readonly recipesService: RecipesService,
    private readonly usersService: UsersService,
  ) {}

  // 1) Navaden create (z avtorjem)
  @Post()
  async create(@Body() createRecipeDto: CreateRecipeDto, @Req() req) {
    const userId = req.user.userId;
    const author = await this.usersService.findOne(userId);
    return this.recipesService.createWithAuthor(createRecipeDto, author);
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
    const { title, description, steps, categoryId, categoryName, ingredients } = JSON.parse(req.body.jsonData);

    const createRecipeDto: CreateRecipeDto = {
      title,
      description,
      steps,
      categoryId,
      categoryName,
      ingredients,
    };

    const userId = req.user.userId;
    const author = await this.usersService.findOne(userId);

    const recipe = await this.recipesService.createWithAuthor(createRecipeDto, author);

    if (file) {
      await this.recipesService.saveImage(recipe.id, file.filename);
    }

    return { message: 'Recipe created with image', recipeId: recipe.id };
  }

  // NOV: Vrni recepte trenutnega uporabnika
  @Get('my')
  async findMyRecipes(@Req() req) {
    const userId = req.user.userId;
    return this.recipesService.findByAuthor(userId);
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

  // NOV: Update recept z možnostjo prenosa nove slike preko multipart FormData
  @Patch('edit/:id')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const randomName = uuidv4() + extname(file.originalname);
        callback(null, randomName);
      },
    }),
  }))
  async update(@UploadedFile() file: Express.Multer.File, @Req() req, @Param('id') id: string) {
    const userId = req.user.userId;
    // Preberemo jsonData, ki vsebuje ostala polja recepta
    const updateRecipeDto: UpdateRecipeDto = JSON.parse(req.body.jsonData);
    if (file) {
      // Če je prenesena nova slika, jo dodamo v DTO
      updateRecipeDto.image = file.filename;
    }
    return this.recipesService.update(Number(id), updateRecipeDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.userId;
    return this.recipesService.remove(Number(id), userId);
  }
}
