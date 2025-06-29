import { defineMongooseModel } from '#nuxt/mongoose'
import {Rank} from "~/types/player";

const SubMatchRecordSchema = {
  player_id: {
    type: 'string',
    required: true
  },
  points: {
    type: 'number',
    required: true,
    validate: {
      validator: Number.isInteger,
      message: 'Points must be an integer'
    }
  },
  start_direction: {
    type: 'string',
    required: true,
    enum: ['east', 'south', 'west', 'north']
  },
  rank: {
    type: 'string',
    required: true,
    enum: Object.values(Rank),
  },
  pt: {
    type: 'number',
    required: true,
    validate: {
      validator: Number.isInteger,
      message: 'PT must be an integer',
    },
  },
}

export const MatchRecordSchema = defineMongooseModel({
  name: 'MatchRecord',
  schema: {
    record_1: SubMatchRecordSchema,
    record_2: SubMatchRecordSchema,
    record_3: SubMatchRecordSchema,
    record_4: SubMatchRecordSchema,
    created_at: {
      type: 'string',
      required: true,
    },
  },
})
