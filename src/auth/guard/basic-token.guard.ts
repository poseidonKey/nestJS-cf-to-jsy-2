/**
 * 구현할 기능
 *
 * 1. 요청객체(request)를 불러오고
 *    authorization header로 부터 토큰을 가져온다.
 * 2.authorization.extractTokenFromHeader를 이용해서
 *    사용할 수 있는 형태의 토큰을 추출
 * 3.authService.decodeBasicToken을 실행해서 email과 password를 추출
 * 4. email과 password를 이용해서 사용자를 가져온다.
 *    authService.authenticateWithEmailAndPassword
 * 5. 찾아낸 사용자를 1번의 요청 객체에 붙여준다.
 *    req.user=user ->4번의 user
 */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    // {'authorization': 'Basic adldlcoocooccocll'}
    // 'Basic adldlcoocooccocll' 을 가져옴
    const rawToken = req.headers['authorization'];
    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    const token = this.authService.extractTokenFromHeader(rawToken, false);

    const { email, password } = this.authService.decodeBasicToken(token);

    const user = this.authService.authenticateWithEmailAndPassword({
      email,
      password,
    });

    req.user = user;

    return true;
  }
}
