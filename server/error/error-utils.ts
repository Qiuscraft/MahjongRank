import {ErrorCause} from "~/server/error/error-cause";

export function isMyError(error: any): boolean {
  if (error.cause) {
    return Object.values(ErrorCause).includes(error.cause as ErrorCause);
  } else return false;
}