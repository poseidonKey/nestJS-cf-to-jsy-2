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
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path/posix';
import * as multer from 'multer';
import { v4 as uuid } from 'uuid';
import { POST_IMAGE_PATH } from 'src/common/const/path.const';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel, UsersModel]),
    CommonModule,
    MulterModule.register({
      limits: {
        fieldSize: 100000000, // byte 단위
      },
      fileFilter: (req, file, cb) => {
        /**
         * cb(에러, boolean)
         * 첫째 파라미터에는 에러가 있을 경우 에러 정보를 넣는다
         * 둘째 파라미터는 파일을 받을지 말지의 boolean을 넣어준다.
         */
        const ext = extname(file.originalname);
        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
          return cb(
            new BadRequestException('jpg/jpeg/png 파일만 업로드 가능'),
            false,
          );
        }
        return cb(null, true);
      },
      storage: multer.diskStorage({
        destination: function (req, res, cb) {
          // const uploadPath = path.join(__dirname, '..', 'public', 'posts');
          // cb(null, '/Volumes/backup/study/nestjs/jsy_sns/public/posts/');
          // cb(null, POST_PUBLIC_IMAGE_PATH);
          cb(null, POST_IMAGE_PATH);
        },
        filename: function (req, file, cb) {
          cb(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService, JwtService, AuthService, UsersService],
})
export class PostsModule {}
