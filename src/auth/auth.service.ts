import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entites/users.entity';
import { HASH_ROUNDS, JWT_SECRET } from './const/auth.const';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * 토큰을 사용하게 되는 방식
   *  1. 사용자가 로그인 또는 회원가입을 진행하면
   *    accessToken과 refreshToken을 발급받는다
   *  2. 로그인 할 때는 Basic 토큰과 함께 요청을 보낸다.
   *    Basic 토큰은 '이메일:비밀번호'를 Base64로 인코딩한 형태이다
   *    예) {authorization:'Basic {token}}
   *  3.아무나 접근할 수 없는 정보(private route)를 접근할 때는
   *    accessToken을 Header에 추가해서 요청과 함께 보낸다.
   *    예) {authorization:'Bearer {token}}
   *  4. 토큰과 요청을 함께 받은 서버는 토큰 검증을 통해 현재 요청을
   *    보낸 사용자가 누구인지 알 수 있다.
   *    예) 현재 로그인한 사용자가 작성한 포스트만 가져오려면 토큰의
   *      sub 값에 입력돼 있는 사용자의 포스트만 따로 필터링 할 수 있다.
   *      특정 사용자의 토큰이 없다면 다른 사용자의 데이터를 접근하지 못한다.
   *  5. 모든 토큰은 만료 기간이 있다. 만료 기간이 지나면 새로 토큰을 발급
   *      받아야 한다. 그렇지 않으면 jstService.verify()에서 인증이 통과 되지 못한다.
   *      따라서 access 토큰을 새로 발급 받을 수 있는 /auth/token/access와
   *      refresh 토큰을 받을 수 있는 /auth/token/refresh가 필요하다
   *  6. 토큰이 만료되면 각각의 토큰을 새로 발급 받을 수 있는 위의 엔드포인트
   *      요청을 통해 새로운 토큰을 발급받고 새로운 토큰을 이용해 private route에
   *      접근한다.
   */

  /**
   * Header로 부터 토큰을 받을 때
   * {authorization:'Basic {token}'}
   * {authorization:'Bearer {token}'}
   *
   */

  extractTokenFromHeader(header: string, isBearer: boolean) {
    const splitToken = header.split(' ');
    const prefix = isBearer ? 'Bearer' : 'Basic';
    if (splitToken.length !== 2 || prefix !== splitToken[0]) {
      throw new UnauthorizedException('잘못 된 토큰');
    }

    const token = splitToken[1];
    return token;
  }

  // 즉, alddlcodlk3ldlslscsldldl 식으로
  // 이것을 email:password 로 변형 시키고,
  // 다시 : 기준으로 분리해 사용한다.
  decodeBasicToken(base64String: string) {
    const decoded = Buffer.from(base64String, 'base64').toString('utf8');
    const split = decoded.split(':');
    if (split.length !== 2) {
      throw new UnauthorizedException('잘못 된 유형의 토큰');
    }
    const email = split[0];
    const password = split[1];
    return {
      email,
      password,
    };
  }

  /**
   * 만드는 기능
   * 1. registerWithEmail
   *   - email,nickname, password 를 입력받고 사용자를 생성
   *   - 생성이 완료되면 accessToken, refreshToken을 반환
   *   - 회원가입하면 바로 로그인까지 처리 되도록 한다.
   *
   * 2. loginWithEmail
   *   - email, password를 입력하면 사용자 검증 실시
   *   - 검증 완료되면 access, refreshToken을 반환
   *
   * 3. loginUser
   *   - 1, 2에서 필요한 access,refreshToken을 반환하는 목적
   *
   * 4. signToken : 실제 token을 생성하는 로직
   *   - 3에서 필요한 access, refreshToken을 sign하는 로직
   *
   * 5. authenticateWithEmailAndPassword
   *   - 2에서 로그인을 진행할 때 필요한 기본적인 검증 진행
   *      *. 사용자가 존재하는 지 확인(email)
   *      *. 비밀번호가 맞는지 확인
   *      *. 모두 통과되면 찾은 사용자 정보 반환
   *      *. loginWithEmail에서 반환된 데이터를 기반으로 토큰 생성
   */

  // signToken 만들기
  /**
   * payload에 들어갈 정보
   * 1. email
   * 2. sub : id
   * 3. type: 'access' | 'refresh'
   */

  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: isRefreshToken ? 3600 : 300, // 만료 시간 설정
    });
  }

  loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    const existingUser = await this.usersService.getUserByEmail(user.email);
    if (!existingUser) {
      throw new UnauthorizedException('존재하지 않는 사용자');
    }
    /**
     * 파라미터
     *  1. 입력 된 비밀번호
     *  2. 입력된 해시와 사용자 정보에 저장돼 있는 해시와 비교
     */
    const passOk = await bcrypt.compare(user.password, existingUser.password);
    if (!passOk) {
      throw new UnauthorizedException('비밀번호가 틀렸습니다.');
    }

    return existingUser;
  }

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.authenticateWithEmailAndPassword(user);

    return this.loginUser(existingUser);
  }

  async registerWithEmail(user: RegisterUserDto) {
    const hash = await bcrypt.hash(user.password, HASH_ROUNDS);

    const newUser = await this.usersService.createUser({
      ...user,
      password: hash,
    });

    return this.loginUser(newUser);
  }

  // 토큰 검증
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: JWT_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('토큰이 만료됐거나 잘못 된 토큰입니다.');
    }
  }

  // 토큰 재발급
  rotateToken(token: string, isRefreshToken: boolean) {
    const decoded = this.jwtService.verify(token, {
      secret: JWT_SECRET,
    });

    /**
     * decoded에 있는 정보
     * sub :id
     * email: email
     * type : 'access' 인가 'refresh'
     */
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException(
        '토큰 재 발급은 refresh 토큰 만으로만 가능합니다.',
      );
    }

    return this.signToken({ ...decoded }, isRefreshToken);
  }
}
