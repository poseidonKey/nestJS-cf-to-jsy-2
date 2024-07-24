import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class PasswordPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, metadata: ArgumentMetadata) {
    // return value;// 아무 역할도 없이 입력 값 그대로 반환
    if (value.toString().length > 8) {
      throw new BadRequestException('비밀번호는 8자 이하로 하세요');
    }
    return value.toString();
  }
}

@Injectable()
export class MaxLengthPipe implements PipeTransform {
  constructor(
    private readonly length: number,
    private readonly subject: string,
  ) {}
  transform(value: any) {
    if (value.toString.length > this.length) {
      throw new BadRequestException(
        `${this.subject}의 최대 길이는 ${this.length}`,
      );
    }
    return value.toString();
  }
}

@Injectable()
export class MinLengthPipe implements PipeTransform {
  constructor(private readonly length: number) {}
  transform(value: any) {
    if (value.toString.length < this.length) {
      throw new BadRequestException(
        ` current : ${value.toString().length} ->비밀번호의 최소 길이는 ${this.length}`,
      );
    }
    return value.toString();
  }
}
