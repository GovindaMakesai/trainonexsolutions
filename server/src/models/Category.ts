import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 80 },
  },
  { timestamps: true },
);

categorySchema.index({ name: 1 }, { unique: true });

categorySchema.set('toJSON', {
  transform(_doc, ret) {
    const value = ret as { __v?: number };
    delete value.__v;
    return value;
  },
});

export const Category = mongoose.model<ICategory>('Category', categorySchema);
