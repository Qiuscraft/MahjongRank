export interface MatchRecord {
    record_1: SubMatchRecord;
    record_2: SubMatchRecord;
    record_3: SubMatchRecord;
    record_4: SubMatchRecord;
    [property: string]: any;
}

/**
 * SubMatchRecord
 */
export interface SubMatchRecord {
    player_name: string;
    points: number;
    start_direction: StartDirection;
    [property: string]: any;
}

export enum StartDirection {
    East = "east",
    North = "north",
    South = "south",
    West = "west",
}