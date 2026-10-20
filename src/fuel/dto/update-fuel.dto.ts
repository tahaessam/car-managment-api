import { PartialType } from '@nestjs/mapped-types';
import { CreateFuelDto } from './create-fuel.dto.js';

export class UpdateFuelDto extends PartialType(CreateFuelDto) {}
