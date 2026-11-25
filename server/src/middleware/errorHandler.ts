import { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode = 500;
  let message = 'Something went wrong. Please try again.';
  let errors: { field: string; message: string }[] | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'That record could not be found.';
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 422;
    message = 'Please correct the highlighted fields.';
    errors = Object.values(err.errors).map((issue) => ({
      field: issue.path,
      message: issue.message,
    }));
  } else if (typeof err === 'object' && err && 'code' in err && (err as { code?: number }).code === 11000) {
    statusCode = 409;
    const key = Object.keys((err as { keyPattern?: Record<string, unknown> }).keyPattern || {})[0] || 'value';
    message = `That ${key} is already in use.`;
  } else if (typeof err === 'object' && err && 'type' in err && (err as { type?: string }).type === 'entity.too.large') {
    statusCode = 413;
    message = 'That request is too large.';
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};
