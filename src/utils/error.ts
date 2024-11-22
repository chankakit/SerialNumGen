export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function handleError(error: unknown) {
  if (error instanceof ValidationError) {
    alert(error.message);
  } else {
    console.error(error);
    alert('An unexpected error occurred');
  }
}