import { Request, Response } from 'express';
import { ContactMessage } from '../models/ContactMessage';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { getPagination, paginationMeta } from '../utils/pagination';
import { sanitizeText } from '../utils/text';

export const createMessage = asyncHandler(async (req: Request, res: Response) => {
  if (sanitizeText(req.body.website)) {
    res.status(201).json({
      success: true,
      message: 'Message received. We will reply within two working days.',
    });
    return;
  }

  const message = await ContactMessage.create({
    name: sanitizeText(req.body.name),
    email: sanitizeText(req.body.email).toLowerCase(),
    company: sanitizeText(req.body.company) || undefined,
    budget: req.body.budget || undefined,
    message: sanitizeText(req.body.message),
  });

  res.status(201).json({
    success: true,
    message: 'Message received. We will reply within two working days.',
    data: { id: message.id },
  });
});

export const listMessages = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req.query, 10);
  const [messages, total] = await Promise.all([
    ContactMessage.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    ContactMessage.countDocuments(),
  ]);

  res.json({
    success: true,
    data: { messages, pagination: paginationMeta(page, limit, total) },
  });
});

export const markMessageRead = asyncHandler(async (req: Request, res: Response) => {
  const message = await ContactMessage.findById(req.params.id);
  if (!message) throw new AppError('Message not found.', 404);
  message.read = true;
  await message.save();
  res.json({ success: true, message: 'Message marked as read.', data: message });
});

export const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await ContactMessage.findById(req.params.id);
  if (!message) throw new AppError('Message not found.', 404);
  await message.deleteOne();
  res.json({ success: true, message: 'Message deleted.' });
});
