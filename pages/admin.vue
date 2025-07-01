<template>
  <div class="bg-gray-50 min-h-screen">
    <div v-if="!isAuthenticated" class="w-full max-w-md mx-auto p-4 sm:p-6 lg:p-8">
      <div class="bg-white shadow-lg rounded-xl p-8">
        <h1 class="text-3xl font-extrabold mb-6 text-center text-gray-800">管理员登录</h1>
        <el-form @submit.prevent="login" class="space-y-6">
          <el-form-item>
            <el-input v-model="password" type="password" placeholder="请输入密码" size="large" show-password />
          </el-form-item>
          <el-button type="primary" @click="login" :loading="isLoggingIn" size="large" class="w-full transition-transform duration-200 hover:scale-105">
            登录
          </el-button>
        </el-form>
        <el-alert v-if="loginError" :title="loginError" type="error" class="mt-4" show-icon :closable="false" />
      </div>
    </div>

    <div v-else class="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 class="text-3xl sm:text-4xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">管理页面</h1>

      <!-- 添加玩家 -->
      <div class="bg-white shadow-lg rounded-xl p-6 mb-10 max-w-lg mx-auto transition-all duration-300 hover:shadow-xl">
        <h2 class="text-2xl font-bold mb-6 text-center text-gray-700">添加玩家</h2>
        <el-form @submit.prevent="addPlayer" class="flex flex-col sm:flex-row items-center gap-4">
          <el-input v-model="playerName" placeholder="输入玩家名称" size="large" class="flex-grow" />
          <el-button type="primary" :loading="isAddPlayerLoading" @click="addPlayer" size="large" class="w-full sm:w-auto transition-transform duration-200 hover:scale-105">添加</el-button>
        </el-form>
      </div>

      <!-- 添加比赛记录 -->
      <div class="bg-white shadow-lg rounded-xl p-6">
        <h2 class="text-2xl font-bold mb-6 text-center text-gray-700">添加比赛记录</h2>
        <el-form :model="matchRecordForm">
          <div class="flex flex-col lg:flex-row lg:gap-x-8">
            <!-- Player Records -->
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 flex-grow">
              <div v-for="(record, index) in matchRecordForm.records" :key="index" class="bg-gray-50 border border-gray-200 rounded-lg p-5 flex flex-col gap-y-4 transition-all duration-300 hover:shadow-md hover:border-blue-400">
                <h3 class="font-bold text-lg text-center text-gray-600">玩家 {{ index + 1 }}</h3>
                <el-form-item label="名称">
                  <el-input v-model="record.player_name" />
                </el-form-item>
                <el-form-item label="点数">
                  <el-input-number v-model="record.points" :step="100" class="w-full" />
                </el-form-item>
                <el-form-item label="起家">
                  <el-select v-model="record.start_direction" placeholder="请选择" class="w-full">
                    <el-option v-for="item in startDirections" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </div>
            </div>

            <!-- Match Type and Submit -->
            <div class="mt-8 lg:mt-0 lg:w-1/5 flex flex-col justify-center gap-y-6">
              <el-form-item label="类型">
                <el-select v-model="matchRecordForm.match_type" placeholder="请选择" class="w-full">
                  <el-option v-for="item in matchTypes" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <el-button type="primary" :loading="isAddMatchLoading" @click="addMatchRecord" size="large" class="w-full transition-transform duration-200 hover:scale-105">添加记录</el-button>
            </div>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { StartDirection, MatchType } from '~/types/match-record'

// --- Auth ---
const authCookie = useCookie('mahjong-rank-auth')
const isAuthenticated = ref(!!authCookie.value)

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

// --- Login ---
const password = ref('')
const isLoggingIn = ref(false)
const loginError = ref('')

const login = async () => {
  if (!password.value) {
    loginError.value = '请输入密码。'
    return
  }
  isLoggingIn.value = true
  loginError.value = ''
  try {
    await $fetch('/api/v1/admin/login', {
      method: 'POST',
      body: { password: password.value },
    })
    ElMessage.success('登录成功！')
    password.value = ''
    isAuthenticated.value = true
    // Optionally, you can redirect or fetch user info here
  } catch (error: any) {
    loginError.value = error.data.statusMessage || '登录失败，请重试。'
  } finally {
    isLoggingIn.value = false
  }
}
</script>
