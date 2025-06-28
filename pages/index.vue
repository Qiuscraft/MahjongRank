<template>
  <div>
    <name-searcher v-model="inputtingName" @select="handleNameSelect" />
    <data-displayer v-if="selectingName" :data="data" :name="selectingName" />
    <match-records-table v-if="selectingName" :data="data" :name="selectingName" />
  </div>
</template>

<script lang="ts" setup>
import {type MatchRecord, StartDirection} from "~/types/match-record";

const route = useRoute();
const router = useRouter();

// 从路由参数初始化name值
const inputtingName = ref<string>((route.query.name as string) || '');
const selectingName = ref<string>((route.query.name as string) || '');

// 处理name选择事件，更新路由参数
async function handleNameSelect(item: any) {
  const selectedName = item?.value || item;
  if (selectedName) {
    selectingName.value = selectedName;
    await router.push({query: {...route.query, name: selectedName}});
    await loadData()
  }
}

onMounted(async () => {
  if (route.query.name) {
    await handleNameSelect(route.query.name);
  }
})

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
        name: selectingName.value,
      },
    })
  } catch (error: any) {
    ElMessage.error(`获取比赛记录失败：${error.data.message || '未知错误。'}`);
  }
  sortInnerData();
}

</script>

<style>

</style>