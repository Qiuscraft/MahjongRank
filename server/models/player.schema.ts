import { defineMongooseModel } from '#nuxt/mongoose'


import {Rank} from "~/server/utils/player-rank";

export const PlayerSchema = defineMongooseModel({
  name: 'Player',
  schema: {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    rank: {
      type: String,
      required: true,
      enum: Object.values(Rank),
    },
    pt: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function(value: number) {
          return Number.isInteger(value) && value >= 0;
        },
        message: 'pt必须是大于等于0的正整数'
      }
    },
  },
})
