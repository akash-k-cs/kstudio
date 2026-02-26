import { IsString } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  projectId: string;

  @IsString()
  message: string;
}
