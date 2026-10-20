import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateMaintenanceDto {
  @IsString()
  @MinLength(1)
  type: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsDateString()
  date: string;

  @IsNumber()
  @Min(0)
  odometer: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  laborCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  partsCost?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}