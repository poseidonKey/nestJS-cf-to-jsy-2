import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable, tap } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    /**
     * 요청이 들어올 때 req 요청이 들어온 타임스탬프를 만든다
     * [req] { req  path} {req 시간}
     *
     * 요청이 끝날 때(응답이 나갈 때) 다시 타임스탬프 만든다.
     * [res] { req  path} {res 시간} { 소요된 시간 ms}
     */
    const req = context.switchToHttp().getRequest();
    const path = req.originalUrl;
    const now = Date();

    console.log(`[req] ${path} ${now.toLocaleString()}`);

    /**
     * return next.handle()을 실행하는 순간
     * 라우트의 로직이 전부 실행되고 응답이 반환된다.
     * observalble 로.. stream으로 이해하면 될 듯
     */

    return next.handle().pipe(
      tap((observable) => {
        // [res] { req  path} {res 시간} { 소요된 시간 ms}
        //tap은 변형이 불가. 따라서 형식을 바꾸기 위해 map 사용
        return console.log(observable);
      }),
      // map((observable) => {
      //   return {
      //     message: '응답이 변경됐습니다.',
      //     response: observable,
      //   };
      // }),
      tap((observable) => {
        return console.log(
          `[res] ${path} ${now.toLocaleString()} ${new Date().getMilliseconds()} - ${now}`,
        );
      }),
    );
  }
}
