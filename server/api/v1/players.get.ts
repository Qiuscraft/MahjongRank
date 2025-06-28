import {searchPlayer} from "~/server/db-operations/player";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const search_name: string = query.search_name as string;
  try {
    return searchPlayer(search_name);
  } catch (error) {
    console.error('Error fetching players:', error);
    throw createError({
      statusCode: 500,
      statusMessage: '未知错误。'
    });
  }
})
