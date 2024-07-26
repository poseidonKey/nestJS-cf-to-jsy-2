import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RolesEnum } from '../const/roles.const';
// import { PostModel } from 'src/posts/posts.service';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { BaseModel } from 'src/common/entity/base.entity';
import { IsEmail, isEmail, IsString, Length } from 'class-validator';
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { emailValidationMessage } from 'src/common/validation-message/email-validation.message';
import { Exclude } from 'class-transformer';

@Entity()
export class UsersModel extends BaseModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 20,
    unique: true,
  })
  // 1. 길이가 20을 넘지 않을 것
  // 2. 유일무이한 값
  @IsString({
    message: stringValidationMessage,
  })
  // 일반적인 사용
  // @Length(1, 20, {
  //   message: 'nickname은 1~20자 사이로 입력',
  // })
  @Length(1, 20, {
    message: lengthValidationMessage,
  })
  nickname: string;

  @Column({
    unique: true,
  })
  //  유일무이한 값
  @IsString({
    message: stringValidationMessage,
  })
  @IsEmail({}, { message: emailValidationMessage })
  email: string;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  @Length(3, 8, {
    message: lengthValidationMessage, //'비번은 3~8자 사이로 입력',
  })
  @Exclude({
    toPlainOnly: true,
  })
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];
}
