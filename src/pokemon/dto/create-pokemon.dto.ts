import { IsInt, IsPositive, IsString, Min, MinLength } from 'class-validator';

export class CreatePokemonDto {
  @IsString({ message: 'nombre debe ser un string' })
  @MinLength(1)
  name: string;

  @IsInt()
  @IsPositive()
  @Min(1)
  no: number;
}
