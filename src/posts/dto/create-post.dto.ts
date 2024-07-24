import { PickType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';
import { PostsModel } from '../entities/posts.entity';

export class CreatePostDto extends PickType(PostsModel, ['title', 'content']) {}
