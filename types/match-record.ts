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

/**
 * SubMatchRecord
 */
export interface SubMatchRecord {
  player_name: string;
  points: number;
  start_direction: StartDirection;
}

export interface SubMatchRecordUseId {
  player_id: string;
  points: number;
  start_direction: StartDirection;
}

export enum StartDirection {
  East = "east",
  North = "north",
  South = "south",
  West = "west",
}