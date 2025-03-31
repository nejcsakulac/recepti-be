import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  recipeId: number;

  // Dodamo userId kot opcijsko lastnost
  @IsOptional()
  userId?: number;
}
