<script setup lang="ts">
import type {MatchRecord} from "~/types/match-record";
import { Pie } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale
} from 'chart.js';
import type {Player} from "~/types/player";
import {getPromotionPt, getRankChineseName, RANK_ORDER} from "~/utils/player-rank";

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const props = defineProps<{
  player: Player
  data: MatchRecord[]
}>();

// 获取玩家排名
const playerRank = ref<number | null>(null);
const lastRank = ref<number | null>(null);
const defeatPercentage = ref<number | null>(null);
const isLoadingRank = ref(false);

// 计算玩家排名的函数
const calculatePlayerRank = async () => {
  isLoadingRank.value = true;
  try {
    // 获取所有玩家数据
    const allPlayers = await $fetch<Player[]>('/api/v1/players', {
      query: { get_all: 'true' }
    });

    // 排序玩家：先按段位排序，再按PT排序
    const sortedPlayers = allPlayers.sort((a, b) => {
      const aRankIndex = RANK_ORDER.indexOf(a.rank);
      const bRankIndex = RANK_ORDER.indexOf(b.rank);

      // 如果段位不同，按段位排序（高段位在前）
      if (aRankIndex !== bRankIndex) {
        return bRankIndex - aRankIndex;
      }

      // 如果段位相同，按PT排序（高PT在前）
      return b.pt - a.pt;
    });

    // 计算并列排名
    let currentRank = 1;
    const playerRankMap = new Map<string, number>();
    let maxRank = 1; // 记录最后一名的排名

    for (let i = 0; i < sortedPlayers.length; i++) {
      const player = sortedPlayers[i];

      // 如果不是第一个玩家，且与前一个玩家不同分，则更新排名
      if (i > 0) {
        const prevPlayer = sortedPlayers[i - 1];
        const prevRankIndex = RANK_ORDER.indexOf(prevPlayer.rank);
        const currentRankIndex = RANK_ORDER.indexOf(player.rank);

        // 如果段位不同或PT不同，排名递增
        if (prevRankIndex !== currentRankIndex || prevPlayer.pt !== player.pt) {
          currentRank = i + 1;
        }
      }

      playerRankMap.set(player._id, currentRank);
      maxRank = Math.max(maxRank, currentRank); // 更新最后一名排名
    }

    // 获取当前玩家的排名
    const currentPlayerRank = playerRankMap.get(props.player._id);
    playerRank.value = currentPlayerRank || null;
    lastRank.value = maxRank;

    // 计算打败百分比
    if (currentPlayerRank && maxRank > 1) {
      // 计算被打败的玩家数量：总排名数 - 当前排名
      const defeatedPlayers = maxRank - currentPlayerRank;
      // 计算百分比：被打败的玩家数 / (总排名数 - 1) * 100
      // 减1是因为不包括自己
      defeatPercentage.value = Math.round((defeatedPlayers / (maxRank - 1)) * 100);
    } else if (currentPlayerRank === 1 && maxRank > 1) {
      // 如果是第一名且不是唯一玩家，打败100%
      defeatPercentage.value = 100;
    } else if (maxRank === 1) {
      // 如果只有一个玩家，打败0%
      defeatPercentage.value = 0;
    } else {
      defeatPercentage.value = null;
    }
  } catch (error) {
    console.error('获取玩家排名失败:', error);
    playerRank.value = null;
    lastRank.value = null;
    defeatPercentage.value = null;
  } finally {
    isLoadingRank.value = false;
  }
};

// 组件挂载时计算排名
onMounted(() => {
  calculatePlayerRank();
});

// 当玩家数据变化时重新计算排名
watch(() => props.player, () => {
  calculatePlayerRank();
}, { deep: true });

const maxPoints = computed<number>(() => {
  const pointsList = props.data.flatMap(matchRecord => {
    const subRecords = [matchRecord.record_1, matchRecord.record_2, matchRecord.record_3, matchRecord.record_4];
    return subRecords
        .filter(subRecord => subRecord.player_name === props.player.name)
        .map(subRecord => subRecord.points);
  });

  if (pointsList.length === 0) {
    return 0;
  }

  return Math.max(...pointsList);
})

const averagePoints = computed<number>(() => {
  const pointsList = props.data.flatMap(matchRecord => {
    const subRecords = [matchRecord.record_1, matchRecord.record_2, matchRecord.record_3, matchRecord.record_4];
    return subRecords
        .filter(subRecord => subRecord.player_name === props.player.name)
        .map(subRecord => subRecord.points);
  });

  if (pointsList.length === 0) {
    return 0;
  }

  const sum = pointsList.reduce((acc, current) => acc + current, 0);
  return Math.floor(sum / pointsList.length);
})

const averageRank = computed<number>(() => {
  const rankList = props.data.map(matchRecord => {
    if (matchRecord.record_1.player_name === props.player.name) {
      return 1;
    }
    if (matchRecord.record_2.player_name === props.player.name) {
      return 2;
    }
    if (matchRecord.record_3.player_name === props.player.name) {
      return 3;
    }
    if (matchRecord.record_4.player_name === props.player.name) {
      return 4;
    }
    return null;
  }).filter((rank): rank is NonNullable<typeof rank> => rank !== null);

  if (rankList.length === 0) {
    return 0;
  }

  const sum = rankList.reduce((acc, current) => acc + current, 0);
  const average = sum / rankList.length;

  return parseFloat(average.toFixed(2));
})

const rankDistribution = computed(() => {
  const rankList = props.data.map(matchRecord => {
    if (matchRecord.record_1.player_name === props.player.name) {
      return 1;
    }
    if (matchRecord.record_2.player_name === props.player.name) {
      return 2;
    }
    if (matchRecord.record_3.player_name === props.player.name) {
      return 3;
    }
    if (matchRecord.record_4.player_name === props.player.name) {
      return 4;
    }
    return null;
  }).filter((rank): rank is NonNullable<typeof rank> => rank !== null);

  // 统计每个顺位的次数
  const rankCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  rankList.forEach(rank => {
    rankCounts[rank as keyof typeof rankCounts]++;
  });

  return {
    labels: ['第1位', '第2位', '第3位', '第4位'],
    datasets: [{
      data: [rankCounts[1], rankCounts[2], rankCounts[3], rankCounts[4]],
      backgroundColor: [
        '#67C23A', // success绿色 - 第1位
        '#409EFF', // info���������������������蓝色 - 第2位
        '#E6A23C', // warning橙色 - 第3位
        '#F56C6C'  // danger红色 - 第4位
      ],
      borderWidth: 1,
      borderColor: '#fff'
    }]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false, // 不维持纵横比，允许更好��控制图表大小
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        boxWidth: 12, // 减小图例标记的宽度
        padding: 8,   // 减小图例项的内边距
        font: {
          size: 10    // 减小图例字体大小
        }
      }
    },
    title: {
      display: true,
      text: '顺位分布',
      font: {
        size: 12      // 减小标题字体大小
      },
      padding: {
        top: 4,       // 减小标题上下内边距
        bottom: 4
      }
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          const total = context.dataset.data.reduce((sum: number, value: number) => sum + value, 0);
          const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : '0.0';
          return `${context.label}: ${context.parsed}次 (${percentage}%)`;
        }
      }
    }
  }
};

// 计算对位胜率
const headToHeadStats = computed(() => {
  // 收集所有与当前玩家对战的其他玩家
  const opponents = new Map<string, { wins: number, total: number }>();

  props.data.forEach(matchRecord => {
    // 找到当前玩家在这场比赛中的排名
    let currentPlayerRank = 0;
    const subRecords = [matchRecord.record_1, matchRecord.record_2, matchRecord.record_3, matchRecord.record_4];

    // 确定当前玩家的排名
    subRecords.forEach((record, index) => {
      if (record.player_name === props.player.name) {
        currentPlayerRank = index + 1;
      }
    });

    // 如果当前玩家参与了这场比赛
    if (currentPlayerRank > 0) {
      // 检查其他玩���的排名
      subRecords.forEach((record, index) => {
        if (record.player_name !== props.player.name) {
          const opponentRank = index + 1;
          const opponentName = record.player_name;

          // 初始化对手统计
          if (!opponents.has(opponentName)) {
            opponents.set(opponentName, { wins: 0, total: 0 });
          }

          const stats = opponents.get(opponentName)!;
          stats.total++;

          // 如果当前玩家排名更高（数字更小），则算作胜利
          if (currentPlayerRank < opponentRank) {
            stats.wins++;
          }
        }
      });
    }
  });

  // 转换为数组并计算胜率
  const result = Array.from(opponents.entries())
    .map(([opponentName, stats]) => ({
      opponentName,
      wins: stats.wins,
      total: stats.total,
      winRate: stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0
    }));

  return result;
});

// 排序相关���响应式变量
const sortField = ref<'wins' | 'total' | 'winRate'>('total');
const sortOrder = ref<'asc' | 'desc'>('desc');

// 排序后的对位胜率数据
const sortedHeadToHeadStats = computed(() => {
  const stats = [...headToHeadStats.value];

  stats.sort((a, b) => {
    let aValue = a[sortField.value];
    let bValue = b[sortField.value];

    // 数值比较
    if (sortOrder.value === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  return stats;
});

// 切换排序的函数
const toggleSort = (field: 'wins' | 'total' | 'winRate') => {
  if (sortField.value === field) {
    // 如果点击的是当前排序字段���切换排序方向
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    // 如果点击的是新字段，设置为该字段并默认降序
    sortField.value = field;
    sortOrder.value = 'desc';
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- 左���数据卡片区域 -->
      <div class="w-full lg:w-1/4 space-y-4">
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="text-sm text-gray-600">段位</div>
          <div class="text-lg font-bold text-gray-800">{{getRankChineseName(player.rank)}} ({{player.pt}}/{{getPromotionPt(player.rank)}})</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="text-sm text-gray-600">排名</div>
          <div class="text-lg font-bold text-gray-800" v-if="!isLoadingRank && playerRank !== null && lastRank !== null">
            {{ playerRank }}/{{ lastRank }}
            <span v-if="defeatPercentage !== null" class="text-sm text-gray-600 ml-2">
              （打败 {{ defeatPercentage }}% 的玩家）
            </span>
          </div>
          <div class="text-sm text-gray-500 animate-pulse" v-else-if="isLoadingRank">加载中...</div>
          <div class="text-sm text-gray-500" v-else>-</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="text-sm text-gray-600">最高/平均点数</div>
          <div class="text-lg font-bold text-gray-800">{{maxPoints}}/{{averagePoints}}</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="text-sm text-gray-600">平均顺位</div>
          <div class="text-lg font-bold text-gray-800">{{averageRank}}</div>
        </div>
      </div>

      <!-- 中间对位胜率表格 -->
      <div class="w-full lg:w-2/5">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 h-full" v-if="headToHeadStats.length > 0">
          <div class="px-4 py-3 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-800">对位胜率</h3>
            <p class="text-sm text-gray-600 mt-1">与其他玩家的对战统计</p>
          </div>
          <div class="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table class="w-full">
              <thead class="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    对手
                  </th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      @click="toggleSort('winRate')"
                      class="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>胜率</span>
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          v-if="sortField === 'winRate' && sortOrder === 'asc'"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 15l7-7 7 7"
                        />
                        <path
                          v-else
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      @click="toggleSort('total')"
                      class="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>场数</span>
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          v-if="sortField === 'total' && sortOrder === 'asc'"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 15l7-7 7 7"
                        />
                        <path
                          v-else
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="stat in sortedHeadToHeadStats" :key="stat.opponentName" class="hover:bg-gray-50">
                  <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ stat.opponentName }}
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap">
                    <span :class="{
                      'text-green-600 font-semibold': stat.winRate >= 60,
                      'text-blue-600 font-semibold': stat.winRate >= 50 && stat.winRate < 60,
                      'text-orange-600 font-semibold': stat.winRate >= 40 && stat.winRate < 50,
                      'text-red-600 font-semibold': stat.winRate < 40
                    }">
                      {{ stat.winRate }}%
                    </span>
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {{ stat.wins }}/{{ stat.total }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 无对位数据时的占位内容 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 h-full flex items-center justify-center" v-else>
          <div class="text-center">
            <div class="mb-4">
              <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">暂无对位数据</h3>
            <p class="text-gray-500">
              玩家还没有与其他玩家进行过对战
            </p>
          </div>
        </div>
      </div>

      <!-- 右侧图表区域 -->
      <div class="w-full lg:w-2/5 bg-gray-50 rounded-lg p-4 flex flex-col h-full" v-if="data.length > 0">
        <!-- 饼图容器，增加高度 -->
        <div class="chart-container mx-auto">
          <Pie :data="rankDistribution" :options="chartOptions" />
        </div>

        <!-- 顺位统计详情 -->
        <div class="mt-auto grid grid-cols-5 gap-2 text-center">
          <div class="bg-white rounded p-1.5 shadow-sm">
            <div class="text-xs text-gray-500">总局数</div>
            <div class="font-bold text-gray-800 text-sm">{{ data.length }}</div>
          </div>
          <div class="bg-white rounded p-1.5 shadow-sm">
            <div class="text-xs text-gray-500">一位</div>
            <div class="font-bold text-green-600 text-sm">{{ rankDistribution.datasets[0].data[0] }}</div>
          </div>
          <div class="bg-white rounded p-1.5 shadow-sm">
            <div class="text-xs text-gray-500">二位</div>
            <div class="font-bold text-gray-600 text-sm">{{ rankDistribution.datasets[0].data[1] }}</div>
          </div>
          <div class="bg-white rounded p-1.5 shadow-sm">
            <div class="text-xs text-gray-500">三位</div>
            <div class="font-bold text-orange-500 text-sm">{{ rankDistribution.datasets[0].data[2] }}</div>
          </div>
          <div class="bg-white rounded p-1.5 shadow-sm">
            <div class="text-xs text-gray-500">四位</div>
            <div class="font-bold text-red-600 text-sm">{{ rankDistribution.datasets[0].data[3] }}</div>
          </div>
        </div>
      </div>

      <!-- 无数据时的占位内容 -->
      <div class="w-full lg:w-1/3 bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center" v-else>
        <div class="text-center">
          <!-- 图标 -->
          <div class="mb-6">
            <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>

          <!-- 主要文本 -->
          <h3 class="text-xl font-semibold text-gray-700 mb-2">暂无比赛数据</h3>

          <!-- 描述文本 -->
          <p class="text-gray-500 mb-6 max-w-sm">
            该玩家还没有任何比赛记录<br>
            顺位分布图将在有比赛数据后显示
          </p>

          <!-- 装饰性元素 -->
          <div class="flex justify-center space-x-2">
            <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 500px;
  max-height: 500px;
}
</style>