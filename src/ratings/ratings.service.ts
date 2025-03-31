import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { Recipe } from '../recipes/entities/recipe.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createRatingDto: CreateRatingDto): Promise<Rating> {
    const recipe = await this.recipeRepository.findOne({ where: { id: createRatingDto.recipeId } });
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${createRatingDto.recipeId} not found`);
    }
    const user = await this.userRepository.findOne({ where: { id: createRatingDto.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${createRatingDto.userId} not found`);
    }
    const rating = this.ratingRepository.create({
      value: createRatingDto.value,
      recipe,
      user,
    });
    return this.ratingRepository.save(rating);
  }

  async findAll(): Promise<Rating[]> {
    return this.ratingRepository.find({ relations: ['recipe', 'user'] });
  }

  async findOne(id: number): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({ where: { id }, relations: ['recipe', 'user'] });
    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }
    return rating;
  }

  async update(id: number, updateRatingDto: UpdateRatingDto): Promise<Rating> {
    await this.ratingRepository.update(id, updateRatingDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.ratingRepository.delete(id);
  }
}
