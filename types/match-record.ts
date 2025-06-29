import type {Rank} from "~/types/player";

// TODO: 定义东风场南风场
export interface MatchRecord {
  record_1: SubMatchRecord;
  record_2: SubMatchRecord;
  record_3: SubMatchRecord;
  record_4: SubMatchRecord;
  created_at: string;
}

export interface MatchRecordUseId {
  record_1: SubMatchRecordUseId;
  record_2: SubMatchRecordUseId;
  record_3: SubMatchRecordUseId;
  record_4: SubMatchRecordUseId;
  created_at: string;
}

export interface SubMatchRecordInput {
  player_name: string;
  points: number;
  start_direction: StartDirection;
}

export interface MatchRecordInput {
  record_1: SubMatchRecordInput;
  record_2: SubMatchRecordInput;
  record_3: SubMatchRecordInput;
  record_4: SubMatchRecordInput;
  created_at: string;
}

/**
 * SubMatchRecord - 完整的数据模型
 */
export interface SubMatchRecord {
  player_name: string;
  points: number;
  start_direction: StartDirection;
  rank: Rank;
  pt: number;
}

export interface SubMatchRecordUseId {
  player_id: string;
  points: number;
  start_direction: StartDirection;
  rank: Rank;
  pt: number;
}

export enum StartDirection {
  East = "east",
  North = "north",
  South = "south",
  West = "west",
}