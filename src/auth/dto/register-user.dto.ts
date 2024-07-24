import { PickType } from '@nestjs/mapped-types';
import { UsersModel } from 'src/users/entites/users.entity';

export class RegisterUserDto extends PickType(UsersModel, [
  'nickname',
  'email',
  'password',
]) {}
