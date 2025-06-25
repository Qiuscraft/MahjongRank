import { defineMongooseModel } from '#nuxt/mongoose'

export const PlayerSchema = defineMongooseModel({
  name: 'Player',
  schema: {
    name: {
      type: 'string',
      required: true,
      unique: true,
    },
  },
})
