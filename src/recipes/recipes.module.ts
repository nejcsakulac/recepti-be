import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { Recipe } from './entities/recipe.entity';
import { Category } from '../categories/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, Category])],
  controllers: [RecipesController],
  providers: [RecipesService],
  exports: [RecipesService],
})
export class RecipesModule {}
