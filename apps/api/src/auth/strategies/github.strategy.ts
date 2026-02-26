import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService, GithubProfile } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL') || 'http://localhost:4000/auth/github/callback',
      scope: ['user:email', 'repo', 'read:org'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GithubProfile,
  ) {
    return this.authService.validateGithubUser(profile, accessToken, refreshToken);
  }
}
