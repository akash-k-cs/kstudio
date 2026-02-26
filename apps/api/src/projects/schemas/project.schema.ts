import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema()
export class ProjectSettings {
  @Prop()
  language?: string;

  @Prop()
  framework?: string;

  @Prop()
  buildCommand?: string;

  @Prop()
  startCommand?: string;

  @Prop({ type: Map, of: String })
  envVariables?: Map<string, string>;
}

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  ownerId: Types.ObjectId;

  @Prop()
  githubRepo?: string;

  @Prop({ default: 'main' })
  githubBranch?: string;

  @Prop()
  railwayProjectId?: string;

  @Prop({ type: ProjectSettings, default: {} })
  settings: ProjectSettings;

  @Prop()
  workspacePath?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
