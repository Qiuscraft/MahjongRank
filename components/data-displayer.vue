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
  <div>
    <div>段位：{{getRankChineseName(player.rank)}}</div>
    <div>pt：{{player.pt}}/{{getPromotionPt(player.rank)}}</div>
    <div>总局数：{{data.length}}</div>
    <div>最高点数：{{maxPoints}}</div>
    <div>平均点数：{{averagePoints}}</div>
    <div>平均顺位：{{averageRank}}</div>
    

    <div class="chart-container" v-if="data.length > 0">
      <Pie :data="rankDistribution" :options="chartOptions" />
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  width: 100%;
  max-width: 400px;
  margin: 20px auto;
}
</style>