import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageModel } from 'src/common/entity/image.entity';
import { QueryRunner, Repository } from 'typeorm';
import { basename, join } from 'path';
import { POST_IMAGE_PATH, TEMP_FOLDER_PATH } from 'src/common/const/path.const';
import { promises } from 'fs';
import { CreatePostImageDto } from './dto/create-image.dto';

@Injectable()
export class PostsImagesService {
  constructor(
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<ImageModel>(ImageModel)
      : this.imageRepository;
  }

  async createPostImage(dto: CreatePostImageDto, qr?: QueryRunner) {
    const repository = this.getRepository(qr);
    const tempFilePath = join(TEMP_FOLDER_PATH, dto.path);
    try {
      //파일이 존재하는지 확인
      await promises.access(tempFilePath);
    } catch (error) {
      throw new BadGatewayException('존재하지 않는 파일');
    }

    const fileName = basename(tempFilePath);
    const newPath = join(POST_IMAGE_PATH, fileName);

    //save
    const result = await repository.save({
      ...dto,
    });
    // 파일 옮기기
    await promises.rename(tempFilePath, newPath);

    return result;
  }
}
