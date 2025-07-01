<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8 max-w-7xl">
      <!-- 页面标题 -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">麻将排位记录</h1>
        <p class="text-gray-600">查看玩家的比赛记录和统计数据</p>
      </div>

      <!-- 搜索区域 -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div class="max-w-md mx-auto">
          <label class="block text-sm font-medium text-gray-700 mb-2">搜索玩家</label>
          <name-searcher v-model="inputtingName" @select="handleNameSelect" />
        </div>
      </div>

      <!-- 数据展示区域 -->
      <div v-if="selectingName && selectingPlayer" class="space-y-8">
        <!-- 统计数据卡片 -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white">{{ selectingPlayer.name }} 的统计数据</h2>
          </div>
          <div class="p-6">
            <data-displayer :data="data" :player="selectingPlayer" />
          </div>
        </div>

        <!-- 比赛记录表格 -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white">比赛记录</h2>
          </div>
          <div class="overflow-x-auto">
            <match-records-table :data="data" :name="selectingName" />
          </div>
        </div>
      </div>

      <!-- 空状态提示 -->
      <div v-else-if="!selectingName" class="text-center py-16">
        <div class="text-gray-400 text-6xl mb-4">🎯</div>
        <h3 class="text-xl font-medium text-gray-600 mb-2">开始搜索</h3>
        <p class="text-gray-500">请在上方搜索框中输入玩家姓名</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {type MatchRecord, StartDirection} from "~/types/match-record";
import type {Player} from "~/types/player";

const route = useRoute();
const router = useRouter();

// 从路由参数初始化name值
const inputtingName = ref<string>((route.query.name as string) || '');
const selectingName = ref<string>((route.query.name as string) || '');
const selectingPlayer = ref<Player | undefined>();

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
    selectingPlayer.value = (await $fetch('/api/v1/players', {
      method: 'GET',
      params: {
        exact_name: selectingName.value,
      },
    }))[0];
  } catch (error: any) {
    ElMessage.error(`获取比赛记录失败：${error.data.message || '未知错误。'}`);
  }
  sortInnerData();
}

</script>

<style>

</style>