import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional } from 'class-validator';
export class BasePaginationDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  // @Type(() => Number)
  @IsNumber()
  @IsOptional()
  where__id__more_than?: number;

  @IsNumber()
  @IsOptional()
  where__id__less_than?: number;

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/prefer-as-const
  order__createdAt?: 'ASC' | 'DESC' = 'ASC';

  @IsNumber()
  @IsOptional()
  take: number = 20;
}
