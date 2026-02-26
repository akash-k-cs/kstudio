import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RailwayController } from './railway.controller';
import { RailwayService } from './railway.service';
import { Deployment, DeploymentSchema } from './schemas/deployment.schema';
import { AuthModule } from '../auth/auth.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Deployment.name, schema: DeploymentSchema }]),
    AuthModule,
    ProjectsModule,
  ],
  controllers: [RailwayController],
  providers: [RailwayService],
  exports: [RailwayService],
})
export class RailwayModule {}
