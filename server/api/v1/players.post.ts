import { PlayerSchema } from "~/server/models/player.schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const name = body.name;

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name is required',
    });
  }

  try {
    const insertedResult = await PlayerSchema.insertOne({
      name: name,
    });

    return {
      _id: insertedResult._id,
      name: insertedResult.name,
    }

  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Unknown Error',
    });
  }

})
