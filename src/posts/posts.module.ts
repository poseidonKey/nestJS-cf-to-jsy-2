import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { UsersModel } from 'src/users/entites/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostsModel, UsersModel])],
  controllers: [PostsController],
  providers: [PostsService, JwtService, AuthService, UsersService],
})
export class PostsModule {}
