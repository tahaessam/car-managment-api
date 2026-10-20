import { UserDocument } from './schemas/user.schema.js';

export abstract class UserRepository {
  abstract findByEmail(email: string): Promise<UserDocument | null>;
  abstract findById(id: string): Promise<UserDocument | null>;
  abstract create(data: {
    email: string;
    password: string;
    username: string;
  }): Promise<UserDocument>;
}
