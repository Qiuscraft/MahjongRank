import {getMatchRecordsByPlayerName} from "~/server/db-operations/match-record";
import {isMyError} from "~/server/error/error-utils";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  if (!query.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name parameter is required.'
    });
  }
  const name: string = query.name.toString();

  try {
    return await getMatchRecordsByPlayerName(name);
  } catch (error: any) {
    if (isMyError(error)) {
      throw createError({
        statusCode: 500,
        statusMessage: error.cause,
      });
    }

    console.error('Error fetching match records:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Unknown Error.'
    });
  }
})
