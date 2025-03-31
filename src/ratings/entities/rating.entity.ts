import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Recipe } from '../../recipes/entities/recipe.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  value: number;

  @ManyToOne(() => Recipe, recipe => recipe.ratings, { onDelete: 'CASCADE' })
  recipe: Recipe;

  @ManyToOne(() => User, user => user.ratings, { onDelete: 'CASCADE' })
  user: User;
}
