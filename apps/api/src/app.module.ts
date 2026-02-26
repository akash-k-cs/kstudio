import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { GithubModule } from './github/github.module';
import { OpencodeModule } from './opencode/opencode.module';
import { RailwayModule } from './railway/railway.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    // Configuration - load from root level .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    
    // MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/kstudio',
      }),
      inject: [ConfigService],
    }),
    
    // Feature modules
    AuthModule,
    ProjectsModule,
    GithubModule,
    OpencodeModule,
    RailwayModule,
    WebsocketModule,
  ],
})
export class AppModule {}
