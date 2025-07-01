<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">管理页面</h1>

    <!-- 添加玩家 -->
    <el-card class="mb-8">
      <template #header>
        <div class="card-header">
          <span>添加玩家</span>
        </div>
      </template>
      <el-form @submit.prevent="addPlayer">
        <el-form-item label="玩家名称">
          <el-input v-model="playerName" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="isAddPlayerLoading" @click="addPlayer">添加</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 添加比赛记录 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>添加比赛记录</span>
        </div>
      </template>
      <el-form :model="matchRecordForm" label-width="80px">
        <el-row :gutter="20" class="items-center">
          <el-col :span="20">
            <el-row :gutter="20">
              <el-col :span="6" v-for="(record, index) in matchRecordForm.records" :key="index">
                <el-card class="mb-4">
                  <template #header>
                    <span>玩家 {{ index + 1 }}</span>
                  </template>
                  <el-form-item label="名称">
                    <el-input v-model="record.player_name" />
                  </el-form-item>
                  <el-form-item label="点数">
                    <el-input-number v-model="record.points" :step="100" />
                  </el-form-item>
                  <el-form-item label="起家">
                    <el-select v-model="record.start_direction" placeholder="请选择">
                      <el-option v-for="item in startDirections" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                  </el-form-item>
                </el-card>
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="4">
            <el-form-item label="类型" label-position="top">
              <el-select v-model="matchRecordForm.match_type" placeholder="请选择" class="w-full">
                <el-option v-for="item in matchTypes" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-button type="primary" :loading="isAddMatchLoading" @click="addMatchRecord" class="w-full">添加记录</el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { StartDirection, MatchType } from '~/types/match-record'

// --- Add Player ---
const playerName = ref('')
const isAddPlayerLoading = ref(false)

const addPlayer = async () => {
  if (!playerName.value) {
    ElMessage.error('请输入玩家名称。')
    return
  }
  isAddPlayerLoading.value = true
  try {
    await $fetch('/api/v1/players', {
      method: 'POST',
      body: { name: playerName.value },
    })
    ElMessage.success('玩家添加成功！')
    playerName.value = ''
  } catch (error: any) {
    ElMessage.error(error.data.statusMessage || '添加玩家失败。')
  } finally {
    isAddPlayerLoading.value = false
  }
}

// --- Add Match Record ---
const startDirections = [
  { label: '东', value: StartDirection.East },
  { label: '南', value: StartDirection.South },
  { label: '西', value: StartDirection.West },
  { label: '北', value: StartDirection.North },
]

const matchTypes = [
  { label: '东风战', value: MatchType.East },
  { label: '南风场', value: MatchType.South },
]

const createInitialRecords = () => ([
  { player_name: '', points: 25000, start_direction: StartDirection.East },
  { player_name: '', points: 25000, start_direction: StartDirection.South },
  { player_name: '', points: 25000, start_direction: StartDirection.West },
  { player_name: '', points: 25000, start_direction: StartDirection.North },
])

const matchRecordForm = reactive({
  records: createInitialRecords(),
  match_type: MatchType.South,
})

const isAddMatchLoading = ref(false)

const addMatchRecord = async () => {
  isAddMatchLoading.value = true
  try {
    const payload = {
      record_1: matchRecordForm.records[0],
      record_2: matchRecordForm.records[1],
      record_3: matchRecordForm.records[2],
      record_4: matchRecordForm.records[3],
      match_type: matchRecordForm.match_type,
      created_at: new Date().toISOString(),
    }

    await $fetch('/api/v1/match-records', {
      method: 'POST',
      body: payload,
    })

    ElMessage.success('比赛记录添加成功！')
    // Reset form
    matchRecordForm.records = createInitialRecords()
  } catch (error: any) {
    ElMessage.error(error.data.statusMessage || '添加比赛记录失败。')
  } finally {
    isAddMatchLoading.value = false
  }
}
</script>
