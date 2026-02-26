import { Module } from '@nestjs/common';
import { OpencodeController } from './opencode.controller';
import { OpencodeService } from './opencode.service';
import { AuthModule } from '../auth/auth.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [AuthModule, ProjectsModule],
  controllers: [OpencodeController],
  providers: [OpencodeService],
  exports: [OpencodeService],
})
export class OpencodeModule {}
