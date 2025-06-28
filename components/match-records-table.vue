<script setup lang="ts">
import type {MatchRecord} from "~/types/match-record";
import { StartDirection } from "~/types/match-record";

const props = defineProps<{
  name: string
}>();

const data = ref<MatchRecord[]>([]);

function sortInnerData() {
  data.value.forEach(record => {
    // 将四个子记录放入数组进行排序
    const subRecords = [
      record.record_1,
      record.record_2,
      record.record_3,
      record.record_4
    ];

    // 定义方向优先级（东南西北）
    const directionPriority = {
      [StartDirection.East]: 1,
      [StartDirection.South]: 2,
      [StartDirection.West]: 3,
      [StartDirection.North]: 4
    };

    // 排序：首先按得分降序，得分相同时按方向顺序
    subRecords.sort((a, b) => {
      if (a.points !== b.points) {
        return b.points - a.points; // 得分降序
      }
      // 得分相同时按方向排序（东南西北）
      return directionPriority[a.start_direction] - directionPriority[b.start_direction];
    });

    // 将排序后的结果重新赋值
    record.record_1 = subRecords[0];
    record.record_2 = subRecords[1];
    record.record_3 = subRecords[2];
    record.record_4 = subRecords[3];
  });
}

async function loadData() {
  try {
    data.value = await $fetch('/api/v1/match-records', {
      method: 'GET',
      params: {
        name: props.name,
      },
    })
  } catch (error: any) {
    ElMessage.error(`获取比赛记录失败：${error.data.message || '未知错误。'}`);
  }
  sortInnerData();
}

// 暴露 loadData 方法给父组件
defineExpose({
  loadData
});

</script>

<template>
  <div>
    {{data}}
  </div>
</template>

<style scoped>

</style>