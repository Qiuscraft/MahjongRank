import {Rank} from "~/utils/player-rank";
import {MatchType} from "~/types/match-record";

// 比赛等级枚举
export enum MatchLevel {
  Bronze = "bronze",
  Silver = "silver",
  Gold = "gold",
  Jade = "jade",
  Throne = "throne"
}

// MatchLevel 到中文名称的映射
const matchLevelToChinese: Record<MatchLevel, string> = {
  [MatchLevel.Bronze]: "铜之间",
  [MatchLevel.Silver]: "银之间",
  [MatchLevel.Gold]: "金之间",
  [MatchLevel.Jade]: "玉之间",
  [MatchLevel.Throne]: "王座之间"
};

/**
 * 将比赛等级转换为中文字符串
 * @param matchLevel 比赛等级
 * @returns 对应的中文字符串
 */
export function getMatchLevelChinese(matchLevel: MatchLevel): string {
  return matchLevelToChinese[matchLevel];
}

// 段位到比赛等级的映射
export const rankToMatchLevel: Record<Rank, MatchLevel> = {
  [Rank.Novice1]: MatchLevel.Bronze,
  [Rank.Novice2]: MatchLevel.Bronze,
  [Rank.Novice3]: MatchLevel.Bronze,
  [Rank.Practitioner1]: MatchLevel.Silver,
  [Rank.Practitioner2]: MatchLevel.Silver,
  [Rank.Practitioner3]: MatchLevel.Silver,
  [Rank.Expert1]: MatchLevel.Gold,
  [Rank.Expert2]: MatchLevel.Gold,
  [Rank.Expert3]: MatchLevel.Gold,
  [Rank.Elite1]: MatchLevel.Jade,
  [Rank.Elite2]: MatchLevel.Jade,
  [Rank.Elite3]: MatchLevel.Jade,
  [Rank.Sage1]: MatchLevel.Throne,
  [Rank.Sage2]: MatchLevel.Throne,
  [Rank.Sage3]: MatchLevel.Throne,
};

// 比赛等级推荐最低段位
export const matchLevelMinRank: Record<MatchLevel, Rank> = {
  [MatchLevel.Bronze]: Rank.Novice1,
  [MatchLevel.Silver]: Rank.Practitioner1,
  [MatchLevel.Gold]: Rank.Expert1,
  [MatchLevel.Jade]: Rank.Elite1,
  [MatchLevel.Throne]: Rank.Sage1,
};

// 段位分配置 - 东风场/南风场的1/2顺位额外段位分
const rankBonusConfig = {
  [MatchLevel.Bronze]: { east: [10, 5], south: [20, 10] },
  [MatchLevel.Silver]: { east: [20, 10], south: [40, 20] },
  [MatchLevel.Gold]: { east: [40, 20], south: [80, 40] },
  [MatchLevel.Jade]: { east: [55, 30], south: [110, 55] },
  [MatchLevel.Throne]: { east: [60, 30], south: [120, 60] },
};

// 4顺位扣分配置
export const rank4thPenaltyConfig = {
  [Rank.Novice1]: { east: 0, south: 0 },
  [Rank.Novice2]: { east: 0, south: 0 },
  [Rank.Novice3]: { east: 0, south: 0 },
  [Rank.Practitioner1]: { east: 10, south: 20 },
  [Rank.Practitioner2]: { east: 20, south: 40 },
  [Rank.Practitioner3]: { east: 30, south: 60 },
  [Rank.Expert1]: { east: 40, south: 80 },
  [Rank.Expert2]: { east: 50, south: 100 },
  [Rank.Expert3]: { east: 60, south: 120 },
  [Rank.Elite1]: { east: 80, south: 165 },
  [Rank.Elite2]: { east: 90, south: 180 },
  [Rank.Elite3]: { east: 100, south: 195 },
  [Rank.Sage1]: { east: 110, south: 210 },
  [Rank.Sage2]: { east: 120, south: 225 },
  [Rank.Sage3]: { east: 130, south: 240 },
};

// 马点配置
const umaConfig = [15, 5, -5, -15]; // 1-4顺位的马点

/**
 * 确定比赛等级（根据4名玩家中最高段位）
 */
export function determineMatchLevel(playerRanks: Rank[]): MatchLevel {
  const matchLevels = playerRanks.map(rank => rankToMatchLevel[rank]);
  const levelPriority = [MatchLevel.Throne, MatchLevel.Jade, MatchLevel.Gold, MatchLevel.Silver, MatchLevel.Bronze];

  for (const level of levelPriority) {
    if (matchLevels.includes(level)) {
      return level;
    }
  }
  return MatchLevel.Bronze; // 默认
}

/**
 * 获取段位等级（用于比较段位高低）
 */
export function getRankLevel(rank: Rank): number {
  const rankOrder = [
    Rank.Novice1, Rank.Novice2, Rank.Novice3,
    Rank.Practitioner1, Rank.Practitioner2, Rank.Practitioner3,
    Rank.Expert1, Rank.Expert2, Rank.Expert3,
    Rank.Elite1, Rank.Elite2, Rank.Elite3,
    Rank.Sage1, Rank.Sage2, Rank.Sage3,
  ];
  return rankOrder.indexOf(rank);
}

/**
 * 计算玩家的pt得点
 * @param playerData - 包含所有玩家数据的数组
 * @param matchType - 比赛类型（东风场/南风场）
 * @returns 每个玩家的pt得点数组
 */
export function calculateAllPlayersPt(
  playerData: Array<{points: number, rank: Rank}>,
  matchType: MatchType = MatchType.South
): number[] {
  // 1. 确定比赛等级
  const playerRanks = playerData.map(p => p.rank);
  const matchLevel = determineMatchLevel(playerRanks);

  // 2. 计算顺位（按点数降序排列）
  const playersWithIndex = playerData.map((player, index) => ({ ...player, originalIndex: index }));
  playersWithIndex.sort((a, b) => b.points - a.points);

  // 3. 为每个玩家计算pt
  const results = new Array(4).fill(0);

  playersWithIndex.forEach((player, rank) => {
    const position = rank + 1; // 顺位 1-4

    // 精算点数 = ceil((点棒数 - 25000) / 1000)
    const precisePoints = Math.ceil((player.points - 25000) / 1000);

    // 马点
    const uma = umaConfig[rank];

    // 额外段位分
    let rankBonus = 0;
    if (position <= 2) {
      // 1/2顺位获得额外段位分
      const bonusConfig = rankBonusConfig[matchLevel];
      const bonusArray = matchType === MatchType.East ? bonusConfig.east : bonusConfig.south;
      rankBonus = bonusArray[position - 1];
    } else if (position === 3) {
      // 3顺位额外段位分为0
      rankBonus = 0;
    } else if (position === 4) {
      // 4顺位扣分
      let penaltyRank = player.rank;
      const minRank = matchLevelMinRank[matchLevel];

      // 如果玩家段位低于比赛等级推荐最低段位，按推荐最低段位扣分
      if (getRankLevel(player.rank) < getRankLevel(minRank)) {
        penaltyRank = minRank;
      }

      const penaltyConfig = rank4thPenaltyConfig[penaltyRank];
      rankBonus = -(matchType === MatchType.East ? penaltyConfig.east : penaltyConfig.south);
    }

    // 总得分 = 精算点数 + 马点 + 额外段位分
    results[player.originalIndex] = precisePoints + uma + rankBonus;
  });

  return results;
}
