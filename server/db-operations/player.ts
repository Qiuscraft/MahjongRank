import {Player} from "~/types/player";

export async function searchPlayer(name: string): Promise<Player[]> {
  const searchQuery = name
    ? { name: { $regex: name, $options: 'i' } }
    : {};

  return PlayerSchema.find(searchQuery).select('-__v')
}
