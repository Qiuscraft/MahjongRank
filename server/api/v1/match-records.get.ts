import { PlayerSchema } from '~/server/models/player.schema'
import { MatchRecordSchema } from '~/server/models/match-record.schema'

async function getPlayerIdByName(playerName: string): Promise<string | null> {
  try {
    const player = await PlayerSchema.findOne({ name: playerName }).select('_id')
    return player ? player._id.toString() : null
  } catch (error) {
    console.error('Error finding player by name:', error)
    throw error
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const name = query.name as string | undefined

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name parameter is required.'
    })
  }

  try {
    const playerId = await getPlayerIdByName(name)
    
    if (!playerId) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Player not found.'
      })
    }

    const matchRecords = await MatchRecordSchema.find({
      $or: [
        { 'record_1.player_id': playerId },
        { 'record_2.player_id': playerId },
        { 'record_3.player_id': playerId },
        { 'record_4.player_id': playerId }
      ]
    }).select('-__v').sort({ created_at: -1 })

    // 处理每个记录，将 player_id 替换为 player_name
    const processedRecords = await Promise.all(
      matchRecords.map(async (record) => {
        const recordObj = record.toObject() as any
        
        // 为每个记录获取玩家姓名
        const recordKeys = ['record_1', 'record_2', 'record_3', 'record_4']
        for (const recordKey of recordKeys) {
          if (recordObj[recordKey] && recordObj[recordKey].player_id) {
            const player = await PlayerSchema.findById(recordObj[recordKey].player_id).select('name')
            if (player) {
              recordObj[recordKey].player_name = player.name
              delete recordObj[recordKey].player_id
            }
          }
        }
        
        return recordObj
      })
    )

    return processedRecords;
  } catch (error: any) {
    if (error.statusCode && error.statusMessage) {
      throw error;
    }

    console.error('Error fetching match records:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Unknown Error.'
    })
  }
})
