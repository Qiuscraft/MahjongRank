import { defineMongooseModel } from '#nuxt/mongoose'

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
  }
}

export const MatchRecordSchema = defineMongooseModel({
  name: 'MatchRecord',
  schema: {
    record_1: SubMatchRecordSchema,
    record_2: SubMatchRecordSchema,
    record_3: SubMatchRecordSchema,
    record_4: SubMatchRecordSchema,
    created_at: {
      type: Date,
      default: Date.now
    },
  },
})
