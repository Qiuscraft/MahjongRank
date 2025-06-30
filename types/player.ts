import {Rank} from "~/server/utils/player-rank";

export interface Player {
  _id: string,
  name: string,
  rank: Rank,
  /**
   * 玩家积分 - 必须是大于等于0的正整数
   * @minimum 0
   * @type {number}
   */
  pt: number,
}
