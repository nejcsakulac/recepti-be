import { Controller, Get, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { UsersService } from '../users/users.service';
import { UpdateUserDto } from '../users/dto/update-user.dto';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users')
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    await this.usersService.remove(+id);
    return { message: 'User deleted successfully' };
  }

  // Dodatne endpoint-e (npr. za recepte) lahko dodaš tukaj
}
