<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">添加玩家</h1>
    <el-form @submit.prevent="addPlayer">
      <el-form-item label="玩家名称">
        <el-input v-model="playerName" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addPlayer">添加</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
const playerName = ref('')

const addPlayer = async () => {
  if (!playerName.value) {
    ElMessage.error('请输入玩家名称。')
    return
  }

  try {
    await $fetch('/api/v1/players', {
      method: 'POST',
      body: { name: playerName.value },
    })
    ElMessage.success('玩家添加成功！')
    playerName.value = ''
  } catch (error: any) {
    ElMessage.error(error.data.statusMessage || '添加玩家失败。')
  }
}
</script>

