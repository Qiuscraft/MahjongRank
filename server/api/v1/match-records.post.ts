import {MatchRecord, StartDirection} from "~/types/match-record";
import {subRecordPlayerNameToPlayerId} from "~/server/db-operations/match-record";
import {createMyError, isMyError} from "~/server/error/error-utils";

function isSubMatchRecord(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }

  return (
    data.player_name && data.points && data.start_direction &&
    typeof data.player_name === 'string' &&
    typeof data.points === 'number' &&
    Object.values(StartDirection).includes(data.start_direction)
  );
}

function isMatchRecord(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const requiredFields = ['record_1', 'record_2', 'record_3', 'record_4'];

  // 检查是否包含所有必需字段
  for (const field of requiredFields) {
    if (!data[field] || !isSubMatchRecord(data[field])) {
      return false;
    }
    if (!data['created_at'] || typeof data['created_at'] !== 'string') {
      return false;
    }
  }

  return true;
}

// 验证函数：检查4个start_direction是否包含East、North、South、West各一个
function validateStartDirections(data: MatchRecord): boolean {
  const directions = [
    data.record_1.start_direction,
    data.record_2.start_direction,
    data.record_3.start_direction,
    data.record_4.start_direction
  ];

  const requiredDirections = [StartDirection.East, StartDirection.North, StartDirection.South, StartDirection.West];
  const uniqueDirections = new Set(directions);

  // 检查是否有重复的方向或缺少某个方向
  return uniqueDirections.size === 4 && requiredDirections.every(dir => uniqueDirections.has(dir));
}

// 验证函数：检查4个points总和是否为100000
function validatePointsTotal(data: MatchRecord): boolean {
  const totalPoints = data.record_1.points + data.record_2.points + data.record_3.points + data.record_4.points;
  return totalPoints === 100000;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!isMatchRecord(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid match record format.',
    });
  }

  // 验证start_direction
  if (!validateStartDirections(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid start_direction configuration.',
    });
  }

  // 验证points总和
  if (!validatePointsTotal(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid points total.',
    });
  }

  const {record_1, record_2, record_3, record_4} = body;

  try {
    const [record_1_edited, record_2_edited, record_3_edited, record_4_edited] = await Promise.all([
      subRecordPlayerNameToPlayerId(record_1),
      subRecordPlayerNameToPlayerId(record_2),
      subRecordPlayerNameToPlayerId(record_3),
      subRecordPlayerNameToPlayerId(record_4),
    ]);

    return await MatchRecordSchema.insertOne({
      record_1: record_1_edited,
      record_2: record_2_edited,
      record_3: record_3_edited,
      record_4: record_4_edited,
      created_at: new Date(),
    })

  } catch (error: any) {
    if (isMyError(error)) {
      throw createMyError(error);
    }

    console.error(error)
    // 处理其他未预期的错误
    throw createError({
      statusCode: 500,
      statusMessage: 'Unknown Error.',
    });
  }

})
