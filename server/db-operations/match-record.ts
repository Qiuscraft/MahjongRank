import {MatchRecord, SubMatchRecord, type SubMatchRecordUseId} from "~/types/match-record";
import {getPlayerById, getPlayerIdByName} from "~/server/db-operations/player";
import {MatchRecordSchema} from "~/server/models/match-record.schema";
import {ErrorCause} from "~/server/error/error-cause";


/**
 * 根据玩家名称获取比赛记录
 * @param name - 玩家名称
 * @returns 返回该玩家的所有比赛记录
 * @throws {Error} 当找不到指定名称的玩家时抛出异常
 */
export async function getMatchRecordsByPlayerName(name: string): Promise<MatchRecord[]> {
  const playerId = await getPlayerIdByName(name);
  if (!playerId) {
    throw createError({cause: ErrorCause.PlayerNotFound});
  }
  return getMatchRecordsByPlayerId(playerId);
}

export async function getMatchRecordsByPlayerId(id: string): Promise<MatchRecord[]> {
  const matchRecords = await MatchRecordSchema.find({
    $or: [
      {'record_1.player_id': id},
      {'record_2.player_id': id},
      {'record_3.player_id': id},
      {'record_4.player_id': id}
    ]
  }).select('-__v').sort({created_at: -1});

  // 处理每个记录，将 player_id 替换为 player_name
  return await Promise.all(
    matchRecords.map(async (record) => {
      const recordObj = record.toObject();

      // 为每个记录获取玩家姓名并构建符合 MatchRecord 接口的对象
      const processedRecord: MatchRecord = {
        record_1: await subRecordPlayerIdToPlayerName(recordObj.record_1 as unknown as SubMatchRecordUseId),
        record_2: await subRecordPlayerIdToPlayerName(recordObj.record_2 as unknown as SubMatchRecordUseId),
        record_3: await subRecordPlayerIdToPlayerName(recordObj.record_3 as unknown as SubMatchRecordUseId),
        record_4: await subRecordPlayerIdToPlayerName(recordObj.record_4 as unknown as SubMatchRecordUseId),
        created_at: recordObj.created_at as string,
      };

      return processedRecord;
    })
  );
}

/**
 * 将包含 player_id 的子记录转换为包含 player_name 的子记录
 * @param subRecord - 包含 player_id 的子记录
 * @returns 包含 player_name 的子记录
 * @throws {Error} 当找不到指定 player_id 对应的玩家时抛出 PlayerNotFound 异常
 */
export async function subRecordPlayerIdToPlayerName(subRecord: SubMatchRecordUseId): Promise<SubMatchRecord> {
  const player = await getPlayerById(subRecord.player_id);
  if (!player) {
    throw createError({cause: ErrorCause.PlayerNotFound});
  }

  return {
    player_name: player.name,
    points: subRecord.points,
    start_direction: subRecord.start_direction
  };
}

/**
 * 将包含 player_id 的子记录转换为包含 player_name 的子记录
 * @param subRecord - 包含 player_id 的子记录
 * @returns 包含 player_name 的子记录
 * @throws {Error} 当找不到指定 player_id 对应的玩家时抛出 PlayerNotFound 异常
 */
export async function subRecordPlayerNameToPlayerId(subRecord: SubMatchRecord): Promise<SubMatchRecordUseId> {
  const playerId = await getPlayerIdByName(subRecord.player_name);
  if (!playerId) {
    throw createError({cause: ErrorCause.PlayerNotFound});
  }

  return {
    player_id: playerId,
    points: subRecord.points,
    start_direction: subRecord.start_direction
  };
}