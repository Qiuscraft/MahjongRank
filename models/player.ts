import { defineMongooseModel } from '#nuxt/mongoose'

export const Player = defineMongooseModel({
  name: 'Player',
  schema: {
    name: {
      type: 'string',
      required: true,
      unique: true,
    },
  },
  options: {
    
  },
  hooks(schema) {

  },
})
