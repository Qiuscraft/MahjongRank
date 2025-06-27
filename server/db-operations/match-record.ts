import {MatchRecord} from "~/types/match-record";
import {getPlayerById, getPlayerIdByName} from "~/server/db-operations/player";
import {MatchRecordSchema} from "~/server/models/match-record.schema";


/**
 * 根据玩家名称获取比赛记录
 * @param name - 玩家名称
 * @returns 返回该玩家的所有比赛记录
 * @throws {Error} 当找不到指定名称的玩家时抛出异常
 */
export async function getMatchRecordsByPlayerName(name: string): Promise<MatchRecord[]> {
  const playerId = await getPlayerIdByName(name);
  if (!playerId) {
    throw createError('Player not found.');
  }
  return getMatchRecordsByPlayerId(playerId);
}

export async function getMatchRecordsByPlayerId(id: string): Promise<MatchRecord[]> {
  const matchRecords = await MatchRecordSchema.find({
    $or: [
      { 'record_1.player_id': id },
      { 'record_2.player_id': id },
      { 'record_3.player_id': id },
      { 'record_4.player_id': id }
    ]
  }).select('-__v').sort({ created_at: -1 })

  // 处理每个记录，将 player_id 替换为 player_name
  return await Promise.all(
    matchRecords.map(async (record) => {
      const recordObj = record.toObject() as any;

      // 为每个记录获取玩家姓名
      const recordKeys = ['record_1', 'record_2', 'record_3', 'record_4']
      for (const recordKey of recordKeys) {
        if (recordObj[recordKey] && recordObj[recordKey].player_id) {
          const player = await getPlayerById(recordObj[recordKey].player_id);
          if (player) {
            recordObj[recordKey].player_name = player.name;
            delete recordObj[recordKey].player_id;
          }
        }
      }

      return recordObj;
    })
  );
}