import {getMatchRecordsByPlayerName} from "~/server/db-operations/match-record";
import {createMyAPIError, isMyError} from "~/server/error/error-utils";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  if (!query.name) {
    throw createError({
      statusCode: 400,
      statusMessage: '请输入玩家名称。'
    });
  }
  const name: string = query.name.toString();

  try {
    return await getMatchRecordsByPlayerName(name);
  } catch (error: any) {
    if (isMyError(error)) {
      throw createMyAPIError(error);
    }

    console.error('Error fetching match records:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '未知错误。'
    });
  }
})
