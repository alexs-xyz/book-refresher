export class RefresherRequestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RefresherRequestValidationError';
  }
}
