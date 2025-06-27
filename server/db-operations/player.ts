import {Player} from "~/types/player";
import {PlayerSchema} from "~/server/models/player.schema";

export async function searchPlayer(name: string): Promise<Player[]> {
  const searchQuery = name
    ? {name: {$regex: name, $options: 'i'}}
    : {};

  const players = await PlayerSchema.find(searchQuery).select('-__v');
  return players.map(player => ({
    _id: player._id.toString(),
    name: player.name,
  }));
}

export async function registerPlayer(name: string): Promise<Player> {
  const insertedResult = await PlayerSchema.insertOne({
    name: name,
  });

  return {
    _id: insertedResult._id.toString(),
    name: insertedResult.name,
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
    name: player.name,
  } : null;
}