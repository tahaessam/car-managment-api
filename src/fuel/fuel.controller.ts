import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FuelService } from './fuel.service.js';
import { CreateFuelDto } from './dto/create-fuel.dto.js';
import { UpdateFuelDto } from './dto/update-fuel.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class FuelController {
  constructor(private readonly fuelService: FuelService) {}

  @Post('cars/:carId/fuel-logs')
  create(
    @Param('carId') carId: string,
    @Body() createFuelDto: CreateFuelDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.fuelService.create(carId, req.user.userId, createFuelDto);
  }

  @Get('cars/:carId/fuel-logs')
  findAll(
    @Param('carId') carId: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.fuelService.findAll(carId, req.user.userId);
  }

  @Get('fuel-logs/:id')
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.fuelService.findOne(id, req.user.userId);
  }

  @Patch('fuel-logs/:id')
  update(
    @Param('id') id: string,
    @Body() updateFuelDto: UpdateFuelDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.fuelService.update(id, req.user.userId, updateFuelDto);
  }

  @Delete('fuel-logs/:id')
  remove(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.fuelService.remove(id, req.user.userId);
  }
}
