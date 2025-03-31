import { IsNotEmpty, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateRatingDto {
  @IsInt()
  @Min(1)
  @Max(5)
  value: number;

  @IsNotEmpty()
  recipeId: number;

  @IsOptional()
  userId?: number; // Dodano polje za user
}
