<template>
  <div>
    <UInputMenu 
      ref="inputMenuRef"
      v-model="name" 
      v-model:open="open"
      :items="names" 
      @focus="open = true"
      trailing-icon=""
      icon="i-lucide-search"
    />
  </div>
</template>

<script lang="ts" setup>
interface Player {
  _id: string;
  name: string;
}

const names = ref<string[]>([])
const name = ref<string>('')
const open = ref<boolean>(false)
const inputMenuRef = ref()

// 监听选择事件，选择后自动关闭菜单并取消聚焦
watch(name, (newValue, oldValue) => {
  if (newValue !== oldValue && open.value) {
    open.value = false
    // 取消聚焦
    nextTick(() => {
      inputMenuRef.value?.inputRef?.$el?.blur()
    })
  }
})

const searchName = async () => {
  try {
    const result = await $fetch<Player[]>(`/api/v1/players`, {
      method: 'GET',
      params: {
        search_name: name.value,
      }
    });
    
    names.value = result.map(player => player.name);
    
  } catch (error: any) {
    const toast = useToast()
    toast.add({
      title: 'Failed to fetch player names.',
      description: error.statusMessage || 'Unknown error',
      color: 'error',
    });
  }
}

onMounted(async () => {
  await searchName();
});

</script>

<style>

</style>