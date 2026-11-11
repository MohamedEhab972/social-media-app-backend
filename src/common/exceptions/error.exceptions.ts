interface AError {
  message: string;
  statusCode: number;
  cause?: unknown;
}

export class ApplecationException extends Error implements AError {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500, cause?: unknown) {
    super(message, { cause });
    this.statusCode = statusCode;
  }
}

export class BadRequestException extends ApplecationException {
  constructor(message: string, cause?: unknown) {
    super(message, 400, cause);
  }
}

export class UnauthorizedException extends ApplecationException {
  constructor(message: string, cause?: unknown) {
    super(message, 401, cause);
  }
}

export class ForbiddenException extends ApplecationException {
  constructor(message: string, cause?: unknown) {
    super(message, 403, cause);
  }
}

export class NotFoundException extends ApplecationException {
  constructor(message: string, cause?: unknown) {
    super(message, 404, cause);
  }
}

export class ConflictException extends ApplecationException {
  constructor(message: string, cause?: unknown) {
    super(message, 409, cause);
  }
}
