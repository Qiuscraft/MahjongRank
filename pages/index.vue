<template>
  <div>
    <el-autocomplete
      v-model="name"
      :fetch-suggestions="querySearchAsync"
      placeholder="请输入你的用户名..."
      @select="handleSelect"
    />
  </div>
</template>

<script lang="ts" setup>
interface NameItem {
  value: string
}

interface Player {
  name: string
}

const name = ref<string>('')
const names = ref<NameItem[]>([])

const loadAll = async (): Promise<NameItem[]> => {
  try {
    const result = await $fetch<Player[]>(`/api/v1/players`, {
      method: 'GET',
    });
    
    return result.map(player => ({ value: player.name }));
  } catch (error) {
    ElMessage.error(`Error fetching players: ${error.statusMessage}`);
    return [];
  }
}

let timeout: ReturnType<typeof setTimeout>
const querySearchAsync = (queryString: string, cb: (arg: any) => void) => {
  const results = queryString
    ? names.value.filter(createFilter(queryString))
    : names.value

  clearTimeout(timeout)
  timeout = setTimeout(() => {
    cb(results)
  }, 0)
  // 已经预加载过的数据，不需要延迟
}
const createFilter = (queryString: string) => {
  return (restaurant: NameItem) => {
    return (
      restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

onMounted(async () => {
  names.value = await loadAll()
})

</script>

<style>

</style>