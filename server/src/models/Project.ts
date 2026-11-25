import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IImageAsset {
  url: string;
  publicId: string;
}

export interface IProject extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnail?: IImageAsset;
  gallery: IImageAsset[];
  category: Types.ObjectId;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const imageSchema = new Schema<IImageAsset>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false },
);

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 140 },
    shortDescription: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, required: true, maxlength: 20000 },
    thumbnail: { type: imageSchema, required: false },
    gallery: { type: [imageSchema], default: [] },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    technologies: { type: [String], default: [] },
    projectUrl: { type: String, trim: true, maxlength: 500 },
    githubUrl: { type: String, trim: true, maxlength: 500 },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  },
  { timestamps: true },
);

projectSchema.index({ status: 1, createdAt: -1 });

projectSchema.set('toJSON', {
  transform(_doc, ret) {
    const value = ret as { __v?: number };
    delete value.__v;
    return value;
  },
});

export const Project = mongoose.model<IProject>('Project', projectSchema);
