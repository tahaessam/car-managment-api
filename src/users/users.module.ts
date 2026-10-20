import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema.js';
import { UsersService } from './users.service.js';
import { UserRepository } from './user.repository.js';
import { MongooseUserRepository } from './mongoose-user.repository.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    UsersService,
    MongooseUserRepository,
    { provide: UserRepository, useExisting: MongooseUserRepository },
  ],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}