import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { Category } from '../../categories/entities/category.entity';
import { Rating } from '../../ratings/entities/rating.entity';
import { Comment } from '../../comments/entities/comment.entity';

@Entity()
export class Recipe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Ingredient, ingredient => ingredient.recipe, { cascade: true })
  ingredients: Ingredient[];

  @ManyToOne(() => Category, category => category.recipes, { nullable: true })
  category?: Category;

  @OneToMany(() => Rating, rating => rating.recipe)
  ratings: Rating[];

  @OneToMany(() => Comment, comment => comment.recipe, { cascade: true })
  comments: Comment[];
}
