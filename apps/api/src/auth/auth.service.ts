import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

export interface GithubProfile {
  id: string;
  username: string;
  displayName: string;
  emails: Array<{ value: string }>;
  photos: Array<{ value: string }>;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async validateGithubUser(
    profile: GithubProfile,
    accessToken: string,
    refreshToken: string,
  ): Promise<UserDocument> {
    let user = await this.userModel.findOne({ githubId: profile.id });

    if (!user) {
      user = await this.userModel.create({
        githubId: profile.id,
        username: profile.username,
        email: profile.emails?.[0]?.value || `${profile.username}@github.local`,
        avatarUrl: profile.photos?.[0]?.value || '',
        accessToken,
        refreshToken,
      });
    } else {
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      user.avatarUrl = profile.photos?.[0]?.value || user.avatarUrl;
      await user.save();
    }

    return user;
  }

  async generateJwt(user: UserDocument): Promise<string> {
    const payload = {
      sub: user._id.toString(),
      username: user.username,
      email: user.email,
    };
    return this.jwtService.sign(payload);
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async findByGithubId(githubId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ githubId });
  }
}
