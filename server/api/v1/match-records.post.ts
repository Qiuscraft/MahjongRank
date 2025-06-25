export interface MatchRecord {
  record_1: SubMatchRecord;
  record_2: SubMatchRecord;
  record_3: SubMatchRecord;
  record_4: SubMatchRecord;
}

export interface SubMatchRecord {
  player_name: string;
  points: number;
  start_direction: StartDirection;
}

export enum StartDirection {
  East = "east",
  North = "north",
  South = "south",
  West = "west",
}

// 类型守卫函数：判断是否为 SubMatchRecord
const isSubMatchRecord = (data: any): data is SubMatchRecord => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  return (
    typeof data.player_name === 'string' &&
    typeof data.points === 'number' &&
    Object.values(StartDirection).includes(data.start_direction)
  );
};

// 验证函数：检查4个start_direction是否包含East、North、South、West各一个
const validateStartDirections = (data: MatchRecord): boolean => {
  const directions = [
    data.record_1.start_direction,
    data.record_2.start_direction,
    data.record_3.start_direction,
    data.record_4.start_direction
  ];
  
  const requiredDirections = [StartDirection.East, StartDirection.North, StartDirection.South, StartDirection.West];
  const uniqueDirections = new Set(directions);
  
  // 检查是否有重复的方向或缺少某个方向
  return uniqueDirections.size === 4 && requiredDirections.every(dir => uniqueDirections.has(dir));
};

// 验证函数：检查4个points总和是否为100000
const validatePointsTotal = (data: MatchRecord): boolean => {
  const totalPoints = data.record_1.points + data.record_2.points + data.record_3.points + data.record_4.points;
  return totalPoints === 100000;
};

// 类型守卫函数：判断是否为 MatchRecord
const isMatchRecord = (data: any): data is MatchRecord => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const requiredFields = ['record_1', 'record_2', 'record_3', 'record_4'];
  
  // 检查是否包含所有必需字段
  for (const field of requiredFields) {
    if (!data[field] || !isSubMatchRecord(data[field])) {
      return false;
    }
  }

  return true;
};

// 辅助函数：将 SubMatchRecord 转换为带有 player_id 的记录
const processSubMatchRecord = async (record: SubMatchRecord) => {
  const player = await PlayerSchema.findOne({ name: record.player_name });
  
  if (!player) {
    throw createError({
      statusCode: 404,
      statusMessage: `Player with name ${record.player_name} not found.`,
    });
  }

  return {
    player_id: player._id,
    points: record.points,
    start_direction: record.start_direction,
  };
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!isMatchRecord(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid match record format. All records (record_1, record_2, record_3, record_4) are required with valid player_name, points, and start_direction.',
    });
  }

  // 验证start_direction
  if (!validateStartDirections(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid start_direction configuration. The start_direction values must include exactly one each of East, North, South, and West.',
    });
  }

  // 验证points总和
  if (!validatePointsTotal(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid points total. The sum of all four records\' points must equal 100000.',
    });
  }

  const { record_1, record_2, record_3, record_4 } = body;
  
  try {
    const [record_1_edited, record_2_edited, record_3_edited, record_4_edited] = await Promise.all([
      processSubMatchRecord(record_1),
      processSubMatchRecord(record_2),
      processSubMatchRecord(record_3),
      processSubMatchRecord(record_4),
    ]);

    return await MatchRecordSchema.insertOne({
      record_1: record_1_edited,
      record_2: record_2_edited,
      record_3: record_3_edited,
      record_4: record_4_edited,
      created_at: new Date(),
    })

  } catch (error: any) {
    // 如果是我们抛出的错误，直接重新抛出
    // 这里判断条件不完整，但应该无所谓
    if (error.statusCode === 404) {
      throw error;
    }
    
    console.error(error)
    // 处理其他未预期的错误
    throw createError({
      statusCode: 500,
      statusMessage: 'Unknown Error.',
    });
  }

})
