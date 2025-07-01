import {getPlayerByName, searchPlayer} from "~/server/db-operations/player";
import {createMyError, isMyError} from "~/server/error/error-utils";
import {ErrorCause} from "~/server/error/error-cause";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const search_name: string = query.search_name as string;
  const exact_name: string = query.exact_name as string;
  try {
    if (exact_name && exact_name.length > 0) {
      const player = await getPlayerByName(exact_name);
      if (player) {
        return [player];
      } else {
        throw createError({cause: ErrorCause.PlayerNotFound});
      }
    }
    return searchPlayer(search_name);
  } catch (error) {
    if (isMyError(error)) {
      throw createMyError(error);
    }

    console.error('Error fetching players:', error);
    throw createError({
      statusCode: 500,
      statusMessage: '未知错误。'
    });
  }
})
