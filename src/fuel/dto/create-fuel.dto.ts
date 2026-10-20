import { IsBoolean, IsNumber, Min } from 'class-validator';

export class CreateFuelDto {
  @IsBoolean()
  isFullTank: boolean;

  @IsNumber()
  @Min(0)
  fuelAmount: number;

  @IsNumber()
  @Min(0)
  totalCost: number;

  @IsNumber()
  @Min(0)
  fuelPriceAmount: number;

  @IsNumber()
  @Min(0)
  odometerReading: number;
}
