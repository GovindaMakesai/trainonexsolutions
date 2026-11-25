import mongoose, { Document, Schema } from 'mongoose';

export const BUDGET_OPTIONS = ['Under $10k', '$10k–$25k', '$25k–$50k', '$50k+', 'Not sure yet'] as const;

export interface IContactMessage extends Document {
  name: string;
  email: string;
  company?: string;
  budget?: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const contactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    company: { type: String, trim: true, maxlength: 120 },
    budget: { type: String, enum: BUDGET_OPTIONS },
    message: { type: String, required: true, maxlength: 5000 },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

contactMessageSchema.index({ createdAt: -1 });

contactMessageSchema.set('toJSON', {
  transform(_doc, ret) {
    const value = ret as { __v?: number };
    delete value.__v;
    return value;
  },
});

export const ContactMessage = mongoose.model<IContactMessage>('ContactMessage', contactMessageSchema);
