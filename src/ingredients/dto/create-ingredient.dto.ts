import { IsNotEmpty } from 'class-validator';

export class CreateIngredientDto {
  @IsNotEmpty()
  name: string;

  // Optionally, lahko dodaš tudi recipeId, če želiš ročno povezavo
  // @IsNotEmpty()
  // recipeId: number;
}
