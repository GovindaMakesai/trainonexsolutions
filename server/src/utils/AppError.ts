export type FieldError = {
  field: string;
  message: string;
};

export class AppError extends Error {
  statusCode: number;
  errors?: FieldError[];

  constructor(message: string, statusCode = 500, errors?: FieldError[]) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
