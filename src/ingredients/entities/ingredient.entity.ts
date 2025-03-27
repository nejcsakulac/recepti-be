import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Recipe } from '../../recipes/entities/recipe.entity';

@Entity()
export class Ingredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Recipe, recipe => recipe.ingredients, { onDelete: 'CASCADE' })
  recipe: Recipe;
}
