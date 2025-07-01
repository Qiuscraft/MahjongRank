import {
  MatchRecord,
  MatchRecordUseId,
  SubMatchRecord,
  SubMatchRecordInput,
  type SubMatchRecordUseId
} from "~/types/match-record";
import {getPlayerById, getPlayerIdByName, updatePlayerPt} from "~/server/db-operations/player";
import {MatchRecordSchema} from "~/server/models/match-record.schema";
import {ErrorCause} from "~/server/error/error-cause";
import {calculateAllPlayersPt} from "~/server/utils/pt-calculator";

/**
 * 批量将SubMatchRecordInput转换为SubMatchRecordUseId
 * 包含获取player_id、rank和计算pt（基于所有玩家数据）
 * @param inputs - 输入的SubMatchRecordInput数组
 * @param matchType - 比赛类型（东风场/南风场）
 * @returns 转换后的SubMatchRecordUseId数组
 * @throws {Error} 当找不到指定名称的玩家时抛出异常
 */
export async function batchSubMatchRecordInputToUseId(
  inputs: SubMatchRecordInput[],
  matchType: MatchType = MatchType.South
): Promise<SubMatchRecordUseId[]> {
  // 1. 获取所有玩家信息
  const playerDataPromises = inputs.map(async (input) => {
    const playerId = await getPlayerIdByName(input.player_name);
    if (!playerId) {
      throw createError({cause: ErrorCause.PlayerNotFound});
    }

    const player = await getPlayerById(playerId);
    if (!player) {
      throw createError({cause: ErrorCause.PlayerNotFound});
    }

    return {
      playerId,
      player,
      input
    };
  });

  const playerDataList = await Promise.all(playerDataPromises);

  // 2. 准备pt计算数据
  const ptCalculationData = playerDataList.map(({ player, input }) => ({
    points: input.points,
    rank: player.rank
  }));

  // 3. 计算所有玩家的pt
  const ptResults = calculateAllPlayersPt(ptCalculationData, matchType);

  // 4. 构建结果
  return playerDataList.map(({ playerId, player, input }, index) => ({
    player_id: playerId,
    points: input.points,
    start_direction: input.start_direction,
    rank: player.rank,
    pt: ptResults[index]
  }));
}
/**
 * 将SubMatchRecordUseId转换为SubMatchRecord
 * @param useIdRecord - 使用ID的记录
 * @returns 转换后的SubMatchRecord
 * @throws {Error} 当找不到指定ID的玩家时抛出异常
 */
export async function subMatchRecordUseIdToRecord(useIdRecord: SubMatchRecordUseId): Promise<SubMatchRecord> {
  const player = await getPlayerById(useIdRecord.player_id);
  if (!player) {
    throw createError({cause: ErrorCause.PlayerNotFound});
  }

  return {
    player_name: player.name,
    points: useIdRecord.points,
    start_direction: useIdRecord.start_direction,
    rank: useIdRecord.rank,
    pt: useIdRecord.pt
  };
}

/**
 * 将MatchRecordUseId转换为MatchRecord
 * @param useIdMatchRecord - 使用ID的比赛记录
 * @returns 转换后的MatchRecord
 */
export async function matchRecordUseIdToRecord(useIdMatchRecord: MatchRecordUseId): Promise<MatchRecord> {
  const [record_1, record_2, record_3, record_4] = await Promise.all([
    subMatchRecordUseIdToRecord(useIdMatchRecord.record_1),
    subMatchRecordUseIdToRecord(useIdMatchRecord.record_2),
    subMatchRecordUseIdToRecord(useIdMatchRecord.record_3),
    subMatchRecordUseIdToRecord(useIdMatchRecord.record_4)
  ]);

  return {
    record_1,
    record_2,
    record_3,
    record_4,
    created_at: useIdMatchRecord.created_at,
    match_type: useIdMatchRecord.match_type,
  };
}

/**
 * 根据玩家名称获取比赛记录
 * @param name - 玩家名称
 * @returns 返回该玩家的所有比赛记���
 * @throws {Error} 当找不到指定名称的玩家时抛出异常
 */
export async function getMatchRecordsByPlayerName(name: string): Promise<MatchRecord[]> {
  const playerId = await getPlayerIdByName(name);
  if (!playerId) {
    throw createError({cause: ErrorCause.PlayerNotFound});
  }
  return getMatchRecordsByPlayerId(playerId);
}

/**
 * 根据玩家ID获取比赛记录
 * @param id - 玩家ID
 * @returns 返回该玩家的所有比赛记录
 * @throws {Error} 当找不到指定名称的玩家时抛出异常
 */
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
      return matchRecordPlayerIdToPlayerName(recordObj as unknown as MatchRecordUseId);
    })
  );
}

/**
 * 将包含 player_id 的比赛记录转换为包含 player_name 的比赛记录
 * @param matchRecord - 包含 player_id 的比赛记录
 * @returns 包含 player_name 的比赛记录
 * @throws {Error} 当找不到指定名称的玩家时抛出异常
 */
export async function matchRecordPlayerIdToPlayerName(matchRecord: MatchRecordUseId): Promise<MatchRecord> {
  return {
    record_1: await subRecordPlayerIdToPlayerName(matchRecord.record_1 as unknown as SubMatchRecordUseId),
    record_2: await subRecordPlayerIdToPlayerName(matchRecord.record_2 as unknown as SubMatchRecordUseId),
    record_3: await subRecordPlayerIdToPlayerName(matchRecord.record_3 as unknown as SubMatchRecordUseId),
    record_4: await subRecordPlayerIdToPlayerName(matchRecord.record_4 as unknown as SubMatchRecordUseId),
    created_at: matchRecord.created_at as string,
    match_type: matchRecord.match_type,
  };
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
    start_direction: subRecord.start_direction,
    rank: subRecord.rank,
    pt: subRecord.pt,
  };
}
/**
 * 插入新的比赛记录到数据库
 * @param matchRecordUseId - 包含ID的比赛记录
 * @returns 插入后的比赛记录
 */
export async function insertMatchRecord(matchRecordUseId: MatchRecordUseId): Promise<MatchRecordUseId> {
  const inserted = await MatchRecordSchema.insertOne({
    record_1: matchRecordUseId.record_1,
    record_2: matchRecordUseId.record_2,
    record_3: matchRecordUseId.record_3,
    record_4: matchRecordUseId.record_4,
    created_at: new Date(matchRecordUseId.created_at),
    match_type: matchRecordUseId.match_type,
  });

  return {
    record_1: inserted.record_1 as unknown as SubMatchRecordUseId,
    record_2: inserted.record_2 as unknown as SubMatchRecordUseId,
    record_3: inserted.record_3 as unknown as SubMatchRecordUseId,
    record_4: inserted.record_4 as unknown as SubMatchRecordUseId,
    created_at: inserted.created_at,
    match_type: inserted.match_type as MatchType,
  };
}

/**
 * 更新比赛记录中所有玩家的分数
 * @param matchRecordUseId - 包含ID的比赛记录
 */
export async function updateAllPlayersPoints(matchRecordUseId: MatchRecordUseId): Promise<void> {
  // 提取所有玩家的分数更新信息
  const updates = [
    { playerId: matchRecordUseId.record_1.player_id, ptDelta: matchRecordUseId.record_1.pt },
    { playerId: matchRecordUseId.record_2.player_id, ptDelta: matchRecordUseId.record_2.pt },
    { playerId: matchRecordUseId.record_3.player_id, ptDelta: matchRecordUseId.record_3.pt },
    { playerId: matchRecordUseId.record_4.player_id, ptDelta: matchRecordUseId.record_4.pt }
  ];

  // 并行更新所有玩家的分数
  await Promise.all(
    updates.map(({ playerId, ptDelta }) => updatePlayerPt(playerId, ptDelta))
  );
}
