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

import { MaintenanceService } from './maintenance.service.js';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto.js';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class MaintenanceController {
  constructor(
    private readonly maintenanceService: MaintenanceService,
  ) {}

  @Post('cars/:carId/maintenance')
  create(
    @Param('carId') carId: string,
    @Body() createMaintenanceDto: CreateMaintenanceDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.maintenanceService.create(
      carId,
      req.user.userId,
      createMaintenanceDto,
    );
  }

  @Get('cars/:carId/maintenance')
  findAll(
    @Param('carId') carId: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.maintenanceService.findAll(
      carId,
      req.user.userId,
    );
  }

  @Get('maintenance/:id')
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.maintenanceService.findOne(
      id,
      req.user.userId,
    );
  }

  @Patch('maintenance/:id')
  update(
    @Param('id') id: string,
    @Body() updateMaintenanceDto: UpdateMaintenanceDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.maintenanceService.update(
      id,
      req.user.userId,
      updateMaintenanceDto,
    );
  }

  @Delete('maintenance/:id')
  remove(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.maintenanceService.remove(
      id,
      req.user.userId,
    );
  }
}