<template>
  <div>
    <el-autocomplete
      v-model="name"
      :fetch-suggestions="search"
      placeholder="请输入你的用户名..."
    />
  </div>
</template>

<script lang="ts" setup>
import type {Player} from '~/types/player'

const name = ref('')

interface NameSelectItem {
  value: string
}

const names = ref<NameSelectItem[]>([])

async function loadNames() {
  try {
    const result = await $fetch<Player[]>(`/api/v1/players`, {
      method: 'GET',
    })
    
    names.value = result.map(player => ({ value: player.name }))
  } catch (error: any) {
    ElMessage.error(`Error fetching players: ${error.statusMessage || 'Unknown error'}`)
    names.value = []
  }
}

function search(queryString: string) {
  return queryString
    ? names.value.filter((restaurant: NameSelectItem) => {
      return (
          restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
      )
    })
    : names.value
}

onMounted(async () => {
  await loadNames()
})
</script>

<style>

</style>