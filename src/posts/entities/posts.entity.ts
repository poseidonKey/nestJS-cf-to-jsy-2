import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';
import { join } from 'path';
import { POST_PUBLIC_IMAGE_PATH } from 'src/common/const/path.const';
import { BaseModel } from 'src/common/entity/base.entity';
import { ImageModel } from 'src/common/entity/image.entity';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { UsersModel } from 'src/users/entites/users.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class PostsModel extends BaseModel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UsersModel, (user) => user.posts, { nullable: false })
  // 1. UserModel과 연동한다. foreign key 이용
  // 2. null 이 될 수 없다.
  author: UsersModel;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  title: string;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  content: string;

  // @Column({
  //   nullable: true,
  // })
  // @Transform(({ value }) => {
  //   return value && `/${join(POST_PUBLIC_IMAGE_PATH, value)}`;
  // })
  // image?: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;

  @OneToMany(() => ImageModel, (image) => image.post)
  images: ImageModel[];
}
