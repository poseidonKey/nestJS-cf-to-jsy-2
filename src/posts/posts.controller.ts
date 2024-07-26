import {
  Body,
  Controller,
  // DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  // Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate_post.dto';
import { UsersModel } from 'src/users/entites/users.entity';
import { FileInterceptor } from '@nestjs/platform-express';
// import { UsersModel } from 'src/users/entites/users.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  /**
   * 1) GET /posts
   *     모든 post를 가져온다
   */
  @Get()
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query);
    // return this.postsService.getAllPosts();
  }

  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postGenerateRandom(@User('id') userId: number) {
    console.log(userId);
    await this.postsService.generatePosts(userId);

    return true;
  }

  /**
   * 2) GET /posts/:id
   *  id에 해당하는 post를 가져온다
   */
  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  /**
   * 3) Post /posts
   *  post를 생성한다
   */
  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('image'))
  postPost(
    // @Request() req: any, //User decorator를 사용하므로 더 이상 필요없다
    @User('id') userId: number,
    // @User() user: UsersModel,

    // @Body('authorId') authorId: number,
    @Body() body: CreatePostDto,
    // @Body('title') title: string,
    // @Body('content') content: string,
    // @Body('isPublic', new DefaultValuePipe(true)) isPublic: boolean, // DefaultValue연습용
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // const authorId = req.user.id;
    return this.postsService.createPost(userId, body, file?.filename);
    // return this.postsService.createPost(title, authorId, content);
  }
  /**
   * 4) PUT /posts/:id
   *  id에 해당하는 post를 업데이트 하거나 새로 생성
   */
  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
    // @Body('title') title?: string,
    // @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(id, body);
  }

  /**
   * 5) DELETE /posts/:id
   *  id에 해당하는 post를 삭제한다
   */
  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}
