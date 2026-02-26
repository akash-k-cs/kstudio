import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { OpencodeService } from './opencode.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDocument } from '../auth/schemas/user.schema';
import { ChatMessageDto } from './dto/opencode.dto';

@Controller('opencode')
@UseGuards(JwtAuthGuard)
export class OpencodeController {
  constructor(private opencodeService: OpencodeService) {}

  @Post('chat')
  async chat(@Body() chatDto: ChatMessageDto, @CurrentUser() user: UserDocument) {
    return this.opencodeService.sendMessage(
      chatDto.projectId,
      chatDto.message,
      user._id.toString(),
    );
  }
}
