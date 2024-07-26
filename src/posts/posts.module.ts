import { BadRequestException, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { UsersModel } from 'src/users/entites/users.entity';
import { CommonModule } from 'src/common/common.module';

import { extname } from 'path/posix';

import { POST_IMAGE_PATH } from 'src/common/const/path.const';
import { ImageModel } from 'src/common/entity/image.entity';
import { PostsImagesService } from './image/images.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel, UsersModel, ImageModel]),
    CommonModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    JwtService,
    AuthService,
    UsersService,
    PostsImagesService,
  ],
})
export class PostsModule {}
