import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { Category } from '../../categories/entities/category.entity';
import { Rating } from '../../ratings/entities/rating.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Recipe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column('text', { array: true, nullable: true })
  steps?: string[];

  @Column({ nullable: true })
  image?: string;

  @OneToMany(() => Ingredient, ingredient => ingredient.recipe, { cascade: true })
  ingredients: Ingredient[];

  @ManyToOne(() => Category, category => category.recipes, { nullable: true })
  category?: Category;

  @OneToMany(() => Rating, rating => rating.recipe)
  ratings: Rating[];

  @OneToMany(() => Comment, comment => comment.recipe, { cascade: true })
  comments: Comment[];

  // Avtor recepta
  @ManyToOne(() => User, user => user.recipes, { nullable: true })
  author?: User;
}
