import {MatchRecordUseId, MatchRecordInput, SubMatchRecordInput, StartDirection} from "~/types/match-record";
import {
  batchSubMatchRecordInputToUseId,
  matchRecordUseIdToRecord,
  insertMatchRecord,
  updateAllPlayersPoints
} from "~/server/db-operations/match-record";
import {createMyError, isMyError} from "~/server/error/error-utils";

function isSubMatchRecordInput(data: any): data is SubMatchRecordInput {
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

function isMatchRecordInput(data: any): data is MatchRecordInput {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const requiredFields = ['record_1', 'record_2', 'record_3', 'record_4'];

  // 检查是否包含所有必需字段
  for (const field of requiredFields) {
    if (!data[field] || !isSubMatchRecordInput(data[field])) {
      return false;
    }
  }

  return !(!data['created_at'] || typeof data['created_at'] !== 'string');


}

// 验证函数：检查4个start_direction是否包含East、North、South、West各一个
function validateStartDirections(data: MatchRecordInput): boolean {
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
function validatePointsTotal(data: MatchRecordInput): boolean {
  const totalPoints = data.record_1.points + data.record_2.points + data.record_3.points + data.record_4.points;
  return totalPoints === 100000;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!isMatchRecordInput(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: '参数不正确。',
    });
  }

  // 验证start_direction
  if (!validateStartDirections(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: '玩家起家配置不正确，应为东南西北各一家。',
    });
  }

  // 验证points总和
  if (!validatePointsTotal(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: '点数总数不正确，应为100000.',
    });
  }

  const {record_1, record_2, record_3, record_4, created_at} = body;

  try {
    // 批量处理所有玩家记录，正确计算pt
    const allRecordsUseId = await batchSubMatchRecordInputToUseId([
      record_1, record_2, record_3, record_4
    ]);

    // 构建用于数据库插入的MatchRecordUseId
    const matchRecordUseId: MatchRecordUseId = {
      record_1: allRecordsUseId[0],
      record_2: allRecordsUseId[1],
      record_3: allRecordsUseId[2],
      record_4: allRecordsUseId[3],
      created_at: created_at,
    };

    await updateAllPlayersPoints(matchRecordUseId);

    // 插入到数据库
    const insertedRecord = await insertMatchRecord(matchRecordUseId);

    // 转换为MatchRecord格式返回给前端
    return await matchRecordUseIdToRecord(insertedRecord);

  } catch (error: any) {
    if (isMyError(error)) {
      throw createMyError(error);
    }

    console.error(error)
    // 处理其他未预期的错误
    throw createError({
      statusCode: 500,
      statusMessage: '未知错误。',
    });
  }
})
