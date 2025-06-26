<template>
  <div>
    <UInputMenu 
      v-model="name" 
      v-model:open="open"
      :items="names" 
      @focus="open = true"
      trailing-icon=""
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