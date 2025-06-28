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