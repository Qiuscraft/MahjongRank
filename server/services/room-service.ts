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

function nextRound() {
  switch (round) {
    case Round.East_1: round = Round.East_2; break;
    case Round.East_2: round = Round.East_3; break;
    case Round.East_3: round = Round.East_4; break;
    case Round.East_4: round = Round.South_1; break;
    case Round.South_1: round = Round.South_2; break;
    case Round.South_2: round = Round.South_3; break;
    case Round.South_3: round = Round.South_4; break;
    case Round.South_4: break;
  }}

export function draw(east_start_player_ten: boolean, south_start_player_ten: boolean, west_start_player_ten: boolean, north_start_player_ten: boolean) {
  honba_counter += 1;
  if (!east_start_player || !south_start_player || !west_start_player || !north_start_player) {
    throw createMyBackendError(ErrorCause.RoomNotSet);
  }

  // 创建玩家和听牌状态的映射
  const players = [
    { player: east_start_player, isTen: east_start_player_ten },
    { player: south_start_player, isTen: south_start_player_ten },
    { player: west_start_player, isTen: west_start_player_ten },
    { player: north_start_player, isTen: north_start_player_ten }
  ];

  // 获取听牌和未听牌的玩家
  const tenPlayers = players.filter(p => p.isTen);
  const noTenPlayers = players.filter(p => !p.isTen);

  // 根据听牌数量应用不同规则
  if (tenPlayers.length === 1) {
    // 三家未听，每家给听家1000点
    const tenPlayer = tenPlayers[0].player;
    noTenPlayers.forEach(({ player }) => {
      player.points -= 1000;
      tenPlayer.points += 1000;
    });
  } else if (tenPlayers.length === 2) {
    // 两家未听，每家给一家1500点
    noTenPlayers[0].player.points -= 1500;
    tenPlayers[0].player.points += 1500;

    noTenPlayers[1].player.points -= 1500;
    tenPlayers[1].player.points += 1500;
  } else if (tenPlayers.length === 3) {
    // 一家未听，给三家各1000点
    const noTenPlayer = noTenPlayers[0].player;
    tenPlayers.forEach(({ player }) => {
      noTenPlayer.points -= 1000;
      player.points += 1000;
    });
  }
  // 如果四家都听或都未听，则不需要转移点数

  // 获取当前庄家并检查是否听牌
  const dealer = getDealer();
  const dealerInfo = players.find(p => p.player === dealer);

  // 如果庄家未听牌，执行nextRound函数
  if (dealerInfo && !dealerInfo.isTen) {
    nextRound();
  }
}
