<script setup lang="ts">
import type {MatchRecord} from "~/types/match-record";

const props = defineProps<{
  name: string
  data: MatchRecord[]
}>();

const maxPoints = computed<number>(() => {
  const pointsList = props.data.flatMap(matchRecord => {
    const subRecords = [matchRecord.record_1, matchRecord.record_2, matchRecord.record_3, matchRecord.record_4];
    return subRecords
        .filter(subRecord => subRecord.player_name === props.name)
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
        .filter(subRecord => subRecord.player_name === props.name)
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
    if (matchRecord.record_1.player_name === props.name) {
      return 1;
    }
    if (matchRecord.record_2.player_name === props.name) {
      return 2;
    }
    if (matchRecord.record_3.player_name === props.name) {
      return 3;
    }
    if (matchRecord.record_4.player_name === props.name) {
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
</script>

<template>
  <div>
    <div>总局数：{{data.length}}</div>
    <div>最高点数：{{maxPoints}}</div>
    <div>平均点数：{{averagePoints}}</div>
    <div>平均顺位：{{averageRank}}</div>
  </div>
</template>

<style scoped>

</style>