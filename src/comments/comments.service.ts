import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Recipe } from '../recipes/entities/recipe.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    // 1) Poišči recept
    const recipe = await this.recipeRepository.findOne({ where: { id: createCommentDto.recipeId } });
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${createCommentDto.recipeId} not found`);
    }

    // 2) Poišči userja
    //    createCommentDto.userId pride iz kontrolerja, ki ga dobi iz JWT
    if (!createCommentDto.userId) {
      throw new NotFoundException(`No userId found in dto!`);
    }
    const user = await this.userRepository.findOne({ where: { id: createCommentDto.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${createCommentDto.userId} not found`);
    }

    // 3) Ustvari in shrani
    const comment = this.commentRepository.create({
      content: createCommentDto.content,
      recipe,
      user,
    });
    return this.commentRepository.save(comment);
  }

  async findAll(): Promise<Comment[]> {
    return this.commentRepository.find({ relations: ['recipe', 'user'] });
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ where: { id }, relations: ['recipe', 'user'] });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return comment;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    await this.commentRepository.update(id, updateCommentDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.commentRepository.delete(id);
  }
}
