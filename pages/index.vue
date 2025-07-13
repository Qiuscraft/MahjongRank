<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">

    <!-- 规则按钮 - 位于页面左上角 -->
    <div class="absolute top-4 left-4 sm:top-4 sm:left-4">
      <RuleButton />
    </div>

    <!-- 管理员按钮 - 位于页面右上角 -->
    <div class="absolute top-4 right-4 sm:top-4 sm:right-4">
      <NuxtLink
        to="/admin"
        class="inline-flex items-center px-2 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-xs sm:text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        <svg class="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path>
        </svg>
        <span class="hidden sm:inline">管理后台</span>
        <span class="sm:hidden">管理</span>
      </NuxtLink>
    </div>

    <div class="container mx-auto px-4 pt-16 sm:pt-8 pb-8 max-w-7xl">
      <!-- 页面标题 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">麻将比赛记录</h1>
        <p class="text-gray-600">查看玩家的比赛记录和统计数据</p>
      </div>

      <!-- 搜索区域 -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div class="max-w-md mx-auto">
          <label class="block text-sm font-medium text-gray-700 mb-2">搜索玩家</label>
          <name-searcher v-model="inputtingName" @select="handleNameSelect" @clear="handleNameClear" />
        </div>
      </div>

      <!-- 数据展示区域 -->
      <div v-if="selectingName && selectingPlayer && !loading" class="space-y-8">
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

      <!-- 加载动画 -->
      <div v-else-if="loading" class="flex flex-col items-center justify-center py-12">
        <div class="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p class="text-indigo-600 font-medium">正在加载数据...</p>
      </div>

      <!-- 空状态提示 -->
      <div v-else-if="!selectingName">
        <leader-board :players="players" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {type MatchRecord, StartDirection} from "~/types/match-record";
import type {Player} from "~/types/player";

// 设置页面标题
useHead({
  title: '查询 - 麻将比赛记录'
})

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
    inputtingName.value = selectedName;
    if (route.query.name !== selectedName) {
      await router.push({query: {...route.query, name: selectedName}});
    }
    await loadData()
  }
}

async function handleNameClear() {
  selectingName.value = '';
  selectingPlayer.value = undefined;
  await router.push({query: {...route.query, name: ''}});
}

watch(() => route.query.name, async () => {
  if (route.query.name) {
    await handleNameSelect(route.query.name);
  } else {
    await loadPlayers()
  }
})

onMounted(async () => {
  if (route.query.name) {
    await handleNameSelect(route.query.name);
  } else {
    await loadPlayers()
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

const loading = ref(false)

async function loadData() {
  loading.value = true
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
  } finally {
    loading.value = false
  }
  sortInnerData();
}

const players = ref<Player[]>([]);

async function loadPlayers() {
  try {
    players.value = await $fetch<Player[]>(`/api/v1/players`, {
      method: 'GET',
    })
  } catch (error: any) {
    ElMessage.error(`获取玩家列表失败：${error.data.message || '未知错误。'}`)
    players.value = []
  }
}
</script>

<style>

</style>