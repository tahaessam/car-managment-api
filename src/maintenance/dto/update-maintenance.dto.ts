import { PartialType } from '@nestjs/mapped-types';
import { CreateMaintenanceDto } from './create-maintenance.dto.js';

export class UpdateMaintenanceDto extends PartialType(
  CreateMaintenanceDto,
) {}