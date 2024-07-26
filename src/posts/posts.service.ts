import { CommonService } from './../common/common.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate_post.dto';
import { count } from 'console';
import { ConfigService } from '@nestjs/config';
import {
  ENV_HOST_KEY,
  ENV_PROTOCOL_KEY,
} from 'src/common/const/env-keys.const';
import { basename, join } from 'path';
import {
  POST_IMAGE_PATH,
  PUBLIC_FOLDER_PATH,
  TEMP_FOLDER_PATH,
} from 'src/common/const/path.const';
import { promises } from 'fs';
import { CreatePostImageDto } from './image/dto/create-image.dto';
import { ImageModel } from 'src/common/entity/image.entity';
import { DEFAULT_POST_FIND_OPTIONS } from './const/default-post-find-options.const';

// export interface PostModel {
//   id: number;
//   author: string;
//   title: string;
//   content: string;
//   likeCount: number;
//   commentCount: number;
// }

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
  ) {}

  async getAllPosts() {
    return await this.postsRepository.find({
      ...DEFAULT_POST_FIND_OPTIONS,
    });
  }

  async generatePosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      await this.createPost(userId, {
        title: `post subject ${i}`,
        content: `post Content ${i}`,
        images: [],
      });
    }
  }

  async paginatePosts(dto: PaginatePostDto) {
    return this.commonService.pagenate(
      dto,
      this.postsRepository,
      {
        // relations: {
        //   author: true,
        // },
        // relations: ['author', 'images'],
        ...DEFAULT_POST_FIND_OPTIONS,
      },
      'posts',
    );
    // if (dto.page) {
    //   return this.pagePaginatePosts(dto);
    // } else {
    //   return this.cursorPaginatePosts(dto);
    // }
  }

  async pagePaginatePosts(dto: PaginatePostDto) {
    const [posts, count] = await this.postsRepository.findAndCount({
      skip: dto.take * (dto.page - 1),
      order: { createdAt: dto.order__createdAt },
      take: dto.take,
    });
    return {
      data: posts,
      total: count,
    };
  }

  async cursorPaginatePosts(dto: PaginatePostDto) {
    const where: FindOptionsWhere<PostsModel> = {};

    if (dto.where__id__less_than) {
      where.id = LessThan(dto.where__id__less_than);
    } else if (dto.where__id__more_than) {
      where.id = MoreThan(dto.where__id__more_than);
    }

    const posts = await this.postsRepository.find({
      where: {
        id: MoreThan(dto.where__id__more_than ?? 0),
      },
      order: {
        createdAt: dto.order__createdAt,
      },
      take: dto.take,
    });

    const lastItem =
      posts.length > 0 && posts.length === dto.take
        ? posts[posts.length - 1]
        : null;

    const PROTOCOL = this.configService.get<string>(ENV_PROTOCOL_KEY);
    const HOST = this.configService.get<string>(ENV_HOST_KEY);

    const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/posts`);
    if (nextUrl) {
      for (const key of Object.keys(dto)) {
        if (key !== 'where__id__more_than' && key !== 'where__id__less_than') {
          nextUrl.searchParams.append(key, dto[key]);
          // nextUrl.searchParams.append(key, lastItem.id.toString());
        }
      }
      let key = null;
      if (dto.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }
      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    return {
      data: posts,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: posts.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
      ...DEFAULT_POST_FIND_OPTIONS,
    });
    if (!post) throw new NotFoundException();
    return post;
  }

  async createPost(authorId: number, postDto: CreatePostDto) {
    const post = this.postsRepository.create({
      author: {
        id: authorId,
      },
      ...postDto,
      images: [],
      likeCount: 0,
      commentCount: 0,
    });

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async createPostImage(dto: CreatePostImageDto) {
    const tempFilePath = join(TEMP_FOLDER_PATH, dto.path);

    try {
      await promises.access(tempFilePath);
    } catch (error) {
      throw new BadRequestException('존재하지 않는 파일');
    }

    const fileName = basename(tempFilePath);

    const newPath = join(POST_IMAGE_PATH, fileName);

    const result = await this.imageRepository.save({
      ...dto,
    });
    await promises.rename(tempFilePath, newPath);

    return result;
  }

  async updatePost(postId: number, postDto: UpdatePostDto) {
    /**
     * save의 기능
     *  1) 만약 데이터가 존재하지 않는다면(id 기준으로) 생성한다
     *  2) 객체를 저장한다. create 메서드에서 생성한 객체로
     */
    const { title, content } = postDto;

    const post = await this.postsRepository.findOne({
      ...DEFAULT_POST_FIND_OPTIONS,
      where: {
        id: postId,
      },
    });
    if (!post) throw new NotFoundException('no data');

    if (title) post.title = title;
    if (content) post.content = content;
    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async deletePost(postId: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      },
    });
    if (!post) throw new NotFoundException('no data');
    return await this.postsRepository.delete(postId);

    return postId;
  }
}
