import {Player} from "~/types/player";
import {PlayerSchema} from "~/server/models/player.schema";

import {Rank, getNextRank, getPreviousRank, getRankConfig, RANK_ORDER} from "~/utils/player-rank";
import {createMyAPIError} from "~/server/error/error-utils";
import {ErrorCause} from "~/server/error/error-cause";

export async function searchPlayer(name: string): Promise<Player[]> {
  const searchQuery = name
    ? {name: {$regex: name, $options: 'i'}}
    : {};

  const players = await PlayerSchema.find(searchQuery).select('-__v');
  return players.map(player => ({
    _id: player._id.toString(),
    name: player.name.toString(),
    rank: player.rank.toString() as Rank,
    pt: Number(player.pt),
  }));
}

export async function registerPlayer(name: string): Promise<Player> {
  const insertedResult = await PlayerSchema.insertOne({
    name: name,
    rank: 'novice_1', // 默认初始段位
    pt: 0, // 初始积分为0
  });

  return {
    _id: insertedResult._id.toString(),
    name: insertedResult.name.toString(),
    rank: insertedResult.rank.toString() as Rank,
    pt: Number(insertedResult.pt),
  };
}

export async function getPlayerIdByName(playerName: string): Promise<string | null> {
  const player = await PlayerSchema.findOne({name: playerName}).select('_id')
  return player ? player._id.toString() : null
}

export async function getPlayerById(playerId: string): Promise<Player | null> {
  const player = await PlayerSchema.findById(playerId)
  return player ? {
    _id: player._id.toString(),
    name: player.name.toString(),
    rank: player.rank.toString() as Rank,
    pt: Number(player.pt),
  } : null;
}

export async function getPlayerByName(playerName: string): Promise<Player | null> {
  const player = await PlayerSchema.findOne({name: playerName})
  return player ? {
    _id: player._id.toString(),
    name: player.name.toString(),
    rank: player.rank.toString() as Rank,
    pt: Number(player.pt),
  } : null;
}

/**
 * 更新玩家分数并处理段位变化
 * @param playerId - 玩家ID
 * @param ptDelta - 分数增量（可以为负数）
 * @throws {ErrorCause.PlayerNotFound} 如果找不到玩家
 */
export async function updatePlayerPt(playerId: string, ptDelta: number): Promise<void> {
  // 获取当前玩家信息
  const player = await PlayerSchema.findById(playerId);
  if (!player) {
    throw createMyAPIError(ErrorCause.PlayerNotFound)
  }

  let currentRank = player.rank as unknown as Rank;
  let currentPt = Number(player.pt);
  let newPt = currentPt + ptDelta;

  // 处理分数变化和段位调整
  while (true) {
    const rankConfig = getRankConfig(currentRank);
    const isLowestRank = RANK_ORDER.indexOf(currentRank) === 0;
    const isHighestRank = RANK_ORDER.indexOf(currentRank) === RANK_ORDER.length - 1;
    // 判断是否为初心或雀士段位
    const isNoviceOrPractitioner = currentRank.startsWith('novice_') || currentRank.startsWith('practitioner_');

    if (newPt >= rankConfig.promotionPt && !isHighestRank) {
      // 升级逻辑
      const excess = newPt - rankConfig.promotionPt;
      const nextRank = getNextRank(currentRank);
      const nextRankConfig = getRankConfig(nextRank);

      currentRank = nextRank;
      newPt = nextRankConfig.initialPt + excess;
    } else if (newPt < 0 && !isLowestRank && !isNoviceOrPractitioner) {
      // 降级逻辑 - 只有非初心/雀士段位才会降级
      const deficit = Math.abs(newPt);
      const previousRank = getPreviousRank(currentRank);
      const previousRankConfig = getRankConfig(previousRank);

      currentRank = previousRank;
      newPt = previousRankConfig.initialPt - deficit;
    } else {
      // 处理边界情况
      if (newPt < 0) {
        // 初心/雀士段位或最低段位分数低于0，重置为0
        newPt = 0;
      } else if (newPt >= rankConfig.promotionPt && isHighestRank) {
        // 最高段位分数超出升级分数，重置为升级分数
        newPt = rankConfig.promotionPt;
      }
      break;
    }
  }

  // 更新数据库
  await PlayerSchema.findByIdAndUpdate(playerId, {
    rank: currentRank,
    pt: newPt
  });
}
