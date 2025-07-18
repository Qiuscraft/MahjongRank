<script setup lang="ts">
import type {Player} from '~/types/player'
import {Search} from '@element-plus/icons-vue'
import {getRankChineseName} from "~/utils/player-rank";

const name = defineModel<string>({ default: '' })

const placeholder = defineProps<{
  placeholder?: string
}>()

const placeholderText = placeholder.placeholder || '请输入你的用户名...'

interface NameSelectItem {
  value: string
  label: string
}

const names = ref<NameSelectItem[]>([])

async function loadNames() {
  try {
    const result = await $fetch<Player[]>(`/api/v1/players`, {
      method: 'GET',
    })

    names.value = result.map(player => ({ value: player.name, label: `[${getRankChineseName(player.rank)}] ${player.name}` }))
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
  select: [item: any],
  clear: any,
}>()

function handleSelect(item: any) {
  emit('select', item)
}

function handleClear() {
  emit('clear')
}

onMounted(async () => {
  await loadNames()
})
</script>

<template>
  <div class="relative w-full">
    <el-autocomplete
      v-model="name"
      :fetch-suggestions="search"
      :placeholder="placeholderText"
      @select="handleSelect"
      @clear="handleClear"
      class="w-full"
      size="large"
      clearable
      :popper-class="'search-dropdown'"
      value-key="label"
    >
      <template #prefix>
        <el-icon class="text-gray-400">
          <Search />
        </el-icon>
      </template>
    </el-autocomplete>
  </div>
</template>

<style scoped>

</style>