import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from './entities/recipe.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  // 1) Navaden create (brez avtorja)
  async create(createRecipeDto: CreateRecipeDto): Promise<Recipe> {
    const recipe = this.recipeRepository.create({
      title: createRecipeDto.title,
      description: createRecipeDto.description,
      steps: createRecipeDto.steps,
      // ingredients se že zapišejo zaradi cascade: true
      ingredients: createRecipeDto.ingredients,
    });

    if (createRecipeDto.categoryName) {
      const cat = await this.categoryRepository.findOne({ where: { name: createRecipeDto.categoryName } });
      if (!cat) {
        throw new NotFoundException(`Category with name "${createRecipeDto.categoryName}" not found`);
      }
      recipe.category = cat;
    } else if (createRecipeDto.categoryId) {
      const cat = await this.categoryRepository.findOne({ where: { id: createRecipeDto.categoryId } });
      if (!cat) {
        throw new NotFoundException(`Category with ID ${createRecipeDto.categoryId} not found`);
      }
      recipe.category = cat;
    }

    return this.recipeRepository.save(recipe);
  }

  // 2) Create recept z avtorjem
  async createWithAuthor(createRecipeDto: CreateRecipeDto, author: User): Promise<Recipe> {
    const recipe = this.recipeRepository.create({
      title: createRecipeDto.title,
      description: createRecipeDto.description,
      steps: createRecipeDto.steps,
      ingredients: createRecipeDto.ingredients,
      author, // Nastavimo avtorja
    });

    if (createRecipeDto.categoryName) {
      const cat = await this.categoryRepository.findOne({ where: { name: createRecipeDto.categoryName } });
      if (!cat) {
        throw new NotFoundException(`Category with name "${createRecipeDto.categoryName}" not found`);
      }
      recipe.category = cat;
    } else if (createRecipeDto.categoryId) {
      const cat = await this.categoryRepository.findOne({ where: { id: createRecipeDto.categoryId } });
      if (!cat) {
        throw new NotFoundException(`Category with ID ${createRecipeDto.categoryId} not found`);
      }
      recipe.category = cat;
    }

    return this.recipeRepository.save(recipe);
  }

  // Shrani ime slike
  async saveImage(recipeId: number, filename: string) {
    const recipe = await this.recipeRepository.findOne({ where: { id: recipeId } });
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${recipeId} not found`);
    }
    recipe.image = filename;
    await this.recipeRepository.save(recipe);
  }

  async findTop(limit: number): Promise<any[]> {
    return this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoin('recipe.ratings', 'rating')
      .select([
        'recipe.id as recipe_id',
        'recipe.title as recipe_title',
        'recipe.description as recipe_description',
        'recipe.image as recipe_image',
        'COALESCE(AVG(rating.value), 0) as avgRating',
      ])
      .groupBy('recipe.id')
      .addGroupBy('recipe.image')
      .orderBy('avgRating', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async findByCategory(categoryId: number): Promise<Recipe[]> {
    return this.recipeRepository.find({
      where: { category: { id: categoryId } },
      relations: ['ingredients', 'category', 'ratings', 'comments', 'comments.user'],
    });
  }

  async findAll(): Promise<Recipe[]> {
    return this.recipeRepository.find({
      relations: ['ingredients', 'category', 'ratings', 'comments', 'comments.user'],
    });
  }

  async findOne(id: number): Promise<Recipe> {
    if (!id || isNaN(id)) {
      throw new NotFoundException(`Invalid recipe ID: ${id}`);
    }
    const recipe = await this.recipeRepository.findOne({
      where: { id },
      relations: [
        'ingredients',
        'category',
        'ratings',
        'ratings.user',
        'comments',
        'comments.user',
        'author', // da naloži avtorja
      ],
    });
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }
    return recipe;
  }

  // Nova metoda za iskanje receptov trenutnega uporabnika
  async findByAuthor(userId: number): Promise<Recipe[]> {
    return this.recipeRepository.find({
      where: { author: { id: userId } },
      relations: ['ingredients', 'category', 'ratings', 'comments', 'comments.user', 'author'],
    });
  }

  async update(id: number, updateRecipeDto: UpdateRecipeDto, userId: number): Promise<Recipe> {
    const recipe = await this.findOne(id);
    if (!recipe.author || recipe.author.id !== userId) {
      throw new ForbiddenException('You are not allowed to update this recipe');
    }
    Object.assign(recipe, updateRecipeDto);
    return this.recipeRepository.save(recipe);
  }

  async remove(id: number, userId: number): Promise<void> {
    const recipe = await this.findOne(id);
    if (!recipe.author || recipe.author.id !== userId) {
      throw new ForbiddenException('You are not allowed to delete this recipe');
    }
    await this.recipeRepository.delete(id);
  }
}
