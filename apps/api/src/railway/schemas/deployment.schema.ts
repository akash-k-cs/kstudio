import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeploymentDocument = Deployment & Document;

export type DeploymentStatus = 
  | 'pending'
  | 'building'
  | 'deploying'
  | 'success'
  | 'failed'
  | 'cancelled';

@Schema({ timestamps: true })
export class Deployment {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Project' })
  projectId: Types.ObjectId;

  @Prop()
  railwayDeploymentId?: string;

  @Prop()
  railwayServiceId?: string;

  @Prop({ required: true, default: 'pending' })
  status: DeploymentStatus;

  @Prop()
  url?: string;

  @Prop({ type: [String], default: [] })
  logs: string[];

  @Prop()
  errorMessage?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const DeploymentSchema = SchemaFactory.createForClass(Deployment);
