<script setup lang="ts">
import type {Player} from '~/types/player'

const name = defineModel<string>({ default: '' })

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
    ElMessage.error(`获取玩家列表失败：${error.data.message || '未知错误。'}`)
    names.value = []
  }
  names.value.sort((a, b) => a.value.localeCompare(b.value))
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

const emit = defineEmits<{
  select: [item: any]
}>()

function handleSelect(item: any) {
  emit('select', item)
}

onMounted(async () => {
  await loadNames()
})
</script>

<template>
  <el-autocomplete
    v-model="name"
    :fetch-suggestions="search"
    placeholder="请输入你的用户名..."
    @select="handleSelect"
  />
</template>

<style scoped>

</style>