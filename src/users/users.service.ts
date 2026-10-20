import { Injectable } from '@nestjs/common';
import { UserDocument } from './schemas/user.schema.js';
import { UserRepository } from './user.repository.js';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userRepository.findById(id);
  }

  async create(data: {
    email: string;
    password: string;
    username: string;
  }): Promise<UserDocument> {
    return this.userRepository.create(data);
  }
}
