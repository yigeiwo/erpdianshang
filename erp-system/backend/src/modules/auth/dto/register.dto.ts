import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, MaxLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: '用户名', minLength: 3, maxLength: 50, example: 'newuser' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({ description: '邮箱', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '密码', minLength: 6, maxLength: 100 })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @ApiProperty({ description: '真实姓名', required: false, maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  realName?: string;
}
