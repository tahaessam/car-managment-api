import { IsInt, IsString, Max, Min } from 'class-validator';

export class CreateCarDto {
  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsInt()
  @Min(1886)
  @Max(2100)
  year: number;

  @IsString()
  PlateNum: string;
}