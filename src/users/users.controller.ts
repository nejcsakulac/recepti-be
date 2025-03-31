import {
  Controller,
  Get,
  Patch,
  UseGuards,
  Req,
  Body,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req) {
    const userId = req.user.userId;
    const user = await this.usersService.findOne(userId);
    const { password, ...rest } = user;
    return rest;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(@Req() req, @Body() updateDto: UpdateUserDto) {
    const userId = req.user.userId;
    return this.usersService.update(userId, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const randomName = uuidv4() + extname(file.originalname);
        callback(null, randomName);
      },
    }),
  }))
  async uploadAvatar(@Req() req, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.userId;
    const user = await this.usersService.findOne(userId);
    user.avatar = file.filename;
    await this.usersService.save(user);
    return { message: 'Avatar uploaded', filename: file.filename };
  }
}
