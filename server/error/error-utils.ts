import {ErrorCause} from "~/server/error/error-cause";

export function isMyError(error: any): boolean {
  if (error.cause) {
    return Object.values(ErrorCause).includes(error.cause as ErrorCause);
  } else return false;
}

export function createMyAPIError(error: any) {
  switch (error.cause) {
    case ErrorCause.PlayerNotFound:
      return createError({
        statusCode: 404,
        statusMessage: error.cause,
      })
    default:
      return createError({
        statusCode: 500,
        statusMessage: error.cause,
      });
  }
}

export function createMyBackendError(cause: ErrorCause) {
  return createError({cause: cause});
}