<template>
  <div>
    
  </div>
</template>

<script lang="ts" setup>
const names = ref<string[]>([])
const name = ref<string>('')

const search = async (searchName: string) => {
  try {
    const result = await $fetch(`/api/v1/players`, {
      method: 'GET',
      params: {
        search_name: searchName,
      }
    });
    
    names.value = result.map(player => player.name);
    
  } catch (error) {
    console.error('Error fetching players:', error);
  }
}

onMounted(async () => {
  await search(name.value);
});

</script>

<style>

</style>