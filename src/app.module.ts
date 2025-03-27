import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Stari moduli
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RecipesModule } from './recipes/recipes.module';

// Novi moduli
import { CategoriesModule } from './categories/categories.module';
import { RatingsModule } from './ratings/ratings.module';
import { CommentsModule } from './comments/comments.module';
import { IngredientsModule } from './ingredients/ingredients.module';

// Entitete
import { User } from './users/entities/user.entity';
import { Recipe } from './recipes/entities/recipe.entity';
import { Ingredient } from './ingredients/entities/ingredient.entity';
import { Category } from './categories/entities/category.entity';
import { Rating } from './ratings/entities/rating.entity';
import { Comment } from './comments/entities/comment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'recepti',
      entities: [User, Recipe, Ingredient, Category, Rating, Comment],
      synchronize: true, // Samo za razvoj!
    }),
    AuthModule,
    UsersModule,
    RecipesModule,
    IngredientsModule,
    CategoriesModule,
    RatingsModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
