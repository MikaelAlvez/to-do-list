import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtUser } from '../auth/interfaces/jwt-payload.interface';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

interface AuthRequest extends Request {
  user: JwtUser;
}

function omitPassword(user: User) {
  const { password, ...result } = user;
  void password;
  return result;
}

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async profile(@Request() req: AuthRequest) {
    const user = await this.usersService.findById(req.user.id);
    return omitPassword(user!);
  }

  @Patch('profile')
  async update(@Body() dto: UpdateUserDto, @Request() req: AuthRequest) {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    const updated = await this.usersService.update(req.user.id, dto);
    return omitPassword(updated);
  }

  @Delete('profile')
  async remove(@Request() req: AuthRequest) {
    await this.usersService.remove(req.user.id);
    return { message: 'Conta deletada com sucesso' };
  }
}
