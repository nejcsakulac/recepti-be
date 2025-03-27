import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from './entities/recipe.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createRecipeDto: CreateRecipeDto): Promise<Recipe> {
    const recipe = this.recipeRepository.create(createRecipeDto);
    // Če je categoryId posredovan, nastavi relacijo
    if (createRecipeDto.categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: createRecipeDto.categoryId } });
      if (!category) {
        throw new NotFoundException(`Category with ID ${createRecipeDto.categoryId} not found`);
      }
      recipe.category = category;
    }
    return this.recipeRepository.save(recipe);
  }

  async findAll(): Promise<Recipe[]> {
    return this.recipeRepository.find({ relations: ['ingredients', 'category', 'ratings', 'comments'] });
  }

  async findOne(id: number): Promise<Recipe> {
    const recipe = await this.recipeRepository.findOne({ where: { id }, relations: ['ingredients', 'category', 'ratings', 'comments'] });
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }
    return recipe;
  }

  async update(id: number, updateRecipeDto: UpdateRecipeDto): Promise<Recipe> {
    await this.recipeRepository.update(id, updateRecipeDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.recipeRepository.delete(id);
  }
}
