import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { TerminalService } from './terminal.service';
import { AuthModule } from '../auth/auth.module';
import { ProjectsModule } from '../projects/projects.module';
import { OpencodeModule } from '../opencode/opencode.module';

@Module({
  imports: [AuthModule, ProjectsModule, OpencodeModule],
  providers: [WebsocketGateway, TerminalService],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
