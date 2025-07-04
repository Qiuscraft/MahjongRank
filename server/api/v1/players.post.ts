import {registerPlayer} from "~/server/db-operations/player";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const name = body.name;
  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: '请输入玩家名称。',
    });
  }

  try {
    return registerPlayer(name);
  } catch (error: any) {
    if (error.code && error.code === 11000) {
      throw createError({
        statusCode: 500,
        statusMessage: '玩家名称已存在。',
      });
    }
    
    console.error(error)
    
    throw createError({
      statusCode: 500,
      statusMessage: '未知错误。',
    });
  }

})
