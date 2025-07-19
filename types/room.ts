export enum Round {
  East_1 = "东 1 局",
  East_2 = "东 2 局",
  East_3 = "东 3 局",
  East_4 = "东 4 局",
  South_1 = "南 1 局",
  South_2 = "南 2 局",
  South_3 = "南 3 局",
  South_4 = "南 4 局",
}

export class RoomPlayer {
  _id: string;
  name: string;
  points: number = 25000;

  constructor(id: string, name: string, points?: number) {
    this._id = id;
    this.name = name;
    if (points !== undefined) {
      this.points = points;
    }
  }
}