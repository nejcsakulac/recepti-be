import { IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class IngredientDto {
  @IsNotEmpty()
  name: string;
}

export class CreateRecipeDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientDto)
  ingredients?: IngredientDto[];

  // Opcijsko: id kategorije (če želiš dodati recept k obstoječi kategoriji)
  @IsOptional()
  categoryId?: number;
}
