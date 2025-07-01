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
import {getPromotionPt, getRankChineseName} from "~/utils/player-rank";

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const props = defineProps<{
  player: Player
  data: MatchRecord[]
}>();

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
        '#909399', // info灰蓝色 - 第2位
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
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
    title: {
      display: true,
      text: '顺位分布'
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
</script>

<template>
  <div class="flex flex-col md:flex-row gap-6">
    <!-- 左侧数据区域 -->
    <div class="w-full md:w-1/3 space-y-4">
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="text-sm text-gray-600">段位</div>
        <div class="text-lg font-bold text-gray-800">{{getRankChineseName(player.rank)}}</div>
      </div>
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="text-sm text-gray-600">PT</div>
        <div class="text-lg font-bold text-gray-800">{{player.pt}}/{{getPromotionPt(player.rank)}}</div>
      </div>
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="text-sm text-gray-600">总局数</div>
        <div class="text-lg font-bold text-gray-800">{{data.length}}</div>
      </div>
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="text-sm text-gray-600">最高点数</div>
        <div class="text-lg font-bold text-gray-800">{{maxPoints}}</div>
      </div>
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="text-sm text-gray-600">平均点数</div>
        <div class="text-lg font-bold text-gray-800">{{averagePoints}}</div>
      </div>
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="text-sm text-gray-600">平均顺位</div>
        <div class="text-lg font-bold text-gray-800">{{averageRank}}</div>
      </div>
    </div>

    <!-- 右侧图表区域 -->
    <div class="w-full md:w-2/3 bg-gray-50 rounded-lg p-6 flex items-center justify-center" v-if="data.length > 0">
      <div class="chart-container">
        <Pie :data="rankDistribution" :options="chartOptions" />
      </div>
    </div>

    <!-- 无数据时的占位内容 -->
    <div class="w-full md:w-2/3 bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center min-h-[400px]" v-else>
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
          该玩家还没有参与任何比赛记录<br>
          顺位分布图表将在有比赛数据后显示
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