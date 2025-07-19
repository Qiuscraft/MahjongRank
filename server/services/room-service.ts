import {RoomPlayer, Round} from "~/types/room";
import {createMyBackendError} from "~/server/error/error-utils";
import {ErrorCause} from "~/server/error/error-cause";

let east_start_player: RoomPlayer | null = null;
let south_start_player: RoomPlayer | null = null;
let west_start_player: RoomPlayer | null = null;
let north_start_player: RoomPlayer | null = null;

let round: Round = Round.East_1;
let honba_counter: number = 0;
let riich_pot: number = 0;

export function reset() {
  east_start_player = null;
  south_start_player = null;
  west_start_player = null;
  north_start_player = null;

  round = Round.East_1;
  honba_counter = 0;
  riich_pot = 0;
}

export function riich(player: RoomPlayer, allow_negative_points: boolean = false) {
  if (player.points < 1000 && !allow_negative_points) {
    throw createMyBackendError(ErrorCause.DoNotAllowNegativePoints);
  }
  player.points = player.points - 1000;
  riich_pot += 1000;
}

function getDealer(): RoomPlayer {
  if (!east_start_player || !south_start_player || !west_start_player || !north_start_player) {
    throw createMyBackendError(ErrorCause.RoomNotSet);
  }
  switch (round) {
    case Round.East_1: return east_start_player;
    case Round.East_2: return south_start_player;
    case Round.East_3: return west_start_player;
    case Round.East_4: return north_start_player;
    case Round.South_1: return east_start_player;
    case Round.South_2: return south_start_player;
    case Round.South_3: return west_start_player;
    case Round.South_4: return north_start_player;
  }
}
