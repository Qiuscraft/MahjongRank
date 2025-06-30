export enum Rank {
  Elite1 = "elite_1",
  Elite2 = "elite_2",
  Elite3 = "elite_3",
  Expert1 = "expert_1",
  Expert2 = "expert_2",
  Expert3 = "expert_3",
  Novice1 = "novice_1",
  Novice2 = "novice_2",
  Novice3 = "novice_3",
  Practitioner1 = "practitioner_1",
  Practitioner2 = "practitioner_2",
  Practitioner3 = "practitioner_3",
  Sage1 = "sage_1",
  Sage2 = "sage_2",
  Sage3 = "sage_3",
}

/**
 * 段位配置接口
 */
export interface RankConfig {
  /** 初始分 */
  initialPt: number
  /** 升级分 */
  promotionPt: number
}

/**
 * 段位配置映射表
 * 定义每个段位的初始分和升级分
 */
export const RANK_CONFIG: Record<Rank, RankConfig> = {
  [Rank.Novice1]: {
    initialPt: 0,
    promotionPt: 10
  },
  [Rank.Novice2]: {
    initialPt: 0,
    promotionPt: 40
  },
  [Rank.Novice3]: {
    initialPt: 0,
    promotionPt: 100
  },
  [Rank.Practitioner1]: {
    initialPt: 150,
    promotionPt: 300
  },
  [Rank.Practitioner2]: {
    initialPt: 200,
    promotionPt: 400
  },
  [Rank.Practitioner3]: {
    initialPt: 250,
    promotionPt: 500
  },
  [Rank.Expert1]: {
    initialPt: 300,
    promotionPt: 600
  },
  [Rank.Expert2]: {
    initialPt: 350,
    promotionPt: 700
  },
  [Rank.Expert3]: {
    initialPt: 500,
    promotionPt: 1000
  },
  [Rank.Elite1]: {
    initialPt: 700,
    promotionPt: 1400
  },
  [Rank.Elite2]: {
    initialPt: 800,
    promotionPt: 1600
  },
  [Rank.Elite3]: {
    initialPt: 900,
    promotionPt: 1800
  },
  [Rank.Sage1]: {
    initialPt: 1000,
    promotionPt: 2000
  },
  [Rank.Sage2]: {
    initialPt: 1500,
    promotionPt: 3000
  },
  [Rank.Sage3]: {
    initialPt: 2250,
    promotionPt: 4500
  }
}

/**
 * 获取指定段位的配置
 * @param rank 段位
 * @returns 段位配置
 */
export function getRankConfig(rank: Rank): RankConfig {
  return RANK_CONFIG[rank]
}

/**
 * 获取指定段位的初始分
 * @param rank 段位
 * @returns 初始分
 */
export function getInitialPt(rank: Rank): number {
  return RANK_CONFIG[rank].initialPt
}

/**
 * 获取指定段位的升级分
 * @param rank 段位
 * @returns 升级分
 */
export function getPromotionPt(rank: Rank): number {
  return RANK_CONFIG[rank].promotionPt
}

/**
 * 段位顺序数组（从低到高）
 */
export const RANK_ORDER: Rank[] = [
  Rank.Novice1,
  Rank.Novice2,
  Rank.Novice3,
  Rank.Practitioner1,
  Rank.Practitioner2,
  Rank.Practitioner3,
  Rank.Expert1,
  Rank.Expert2,
  Rank.Expert3,
  Rank.Elite1,
  Rank.Elite2,
  Rank.Elite3,
  Rank.Sage1,
  Rank.Sage2,
  Rank.Sage3
]

/**
 * 获取下一个段位
 * @param currentRank 当前段位
 * @returns 下一个段位，如果已是最高段位则返回当前段位
 */
export function getNextRank(currentRank: Rank): Rank {
  const currentIndex = RANK_ORDER.indexOf(currentRank)
  const nextIndex = currentIndex + 1
  return nextIndex < RANK_ORDER.length ? RANK_ORDER[nextIndex] : currentRank
}

/**
 * 获取上一个段位
 * @param currentRank 当前段位
 * @returns 上一个段位，如果已是最低段位则返回当前段位
 */
export function getPreviousRank(currentRank: Rank): Rank {
  const currentIndex = RANK_ORDER.indexOf(currentRank)
  const previousIndex = currentIndex - 1
  return previousIndex >= 0 ? RANK_ORDER[previousIndex] : currentRank
}
