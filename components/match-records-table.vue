<script setup lang="ts">
import type {MatchRecord} from "~/types/match-record";

const props = defineProps<{
  name: string
}>();

const data = ref<MatchRecord[]>([]);

async function loadData() {
  try {
    data.value = await $fetch('/api/v1/match-records', {
      method: 'GET',
      params: {
        name: props.name,
      },
    })
  } catch (error: any) {
    ElMessage.error(`获取比赛记录失败：${error.statusMessage || '未知错误。'}`);
  }
}

// 暴露 loadData 方法给父组件
defineExpose({
  loadData
});

</script>

<template>

</template>

<style scoped>

</style>