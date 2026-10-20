import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';

import { CarsService } from './cars.service.js';
import { CreateCarDto } from './dto/car.create.dto.js';
import { UpdateCarDto } from './dto/car.update.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('cars')
@UseGuards(JwtAuthGuard)
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  findAll(
    @Request() req: { user: { userId: string } },
    @Query('brand') brand?: string,
  ) {
    return this.carsService.findAll(req.user.userId, brand);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.carsService.findOne(id, req.user.userId);
  }

  @Post()
  create(
    @Body() createCarDto: CreateCarDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.carsService.create(req.user.userId, createCarDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCarDto: UpdateCarDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.carsService.update(id, req.user.userId, updateCarDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.carsService.remove(id, req.user.userId);
  }
}
