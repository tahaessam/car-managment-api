import { PartialType } from '@nestjs/mapped-types';
import { CreateCarDto } from './car.create.dto.js';

export class UpdateCarDto extends PartialType(CreateCarDto) {}