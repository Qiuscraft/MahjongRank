<script setup lang="ts">
import type {MatchRecord} from "~/types/match-record";
import { StartDirection } from "~/types/match-record";
import type {TableColumnCtx} from "element-plus";
import {getRankChineseName} from "~/server/utils/player-rank";
import {determineMatchLevel, getMatchLevelChinese} from "~/server/utils/pt-calculator";

const props = defineProps<{
  name: string
  data: MatchRecord[]
}>();

function formatStartDirection(row: MatchRecord, column: TableColumnCtx<MatchRecord>, cellValue: string): string {
  switch (cellValue) {
    case StartDirection.East:
      return '东';
    case StartDirection.South:
      return '南';
    case StartDirection.West:
      return '西';
    case StartDirection.North:
      return '北';
    default:
      return '';
  }
}

function formatCreatedAt(row: MatchRecord, column: TableColumnCtx<MatchRecord>, cellValue: string): string {
  const date = new Date(cellValue);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

const tableRowClassName = ({
                             row,
                           }: {
  row: MatchRecord
}) => {
  if (row.record_1.player_name === props.name) {
    return 'success-row'
  } else if (row.record_2.player_name === props.name) {
    return 'info-row'
  } else if (row.record_3.player_name === props.name) {
    return 'warning-row'
  } else if (row.record_4.player_name === props.name) {
    return 'danger-row'
  }
  return ''
}

function formatRank(row: MatchRecord, column: TableColumnCtx<MatchRecord>, cellValue: Rank): string {
  return getRankChineseName(cellValue);
}

function formatMatchLevel(row: MatchRecord): string {
  const matchLevel = determineMatchLevel([row.record_1.rank, row.record_2.rank, row.record_3.rank, row.record_4.rank]);
  return getMatchLevelChinese(matchLevel);
}
</script>

<template>
  <div>
    <el-table :data="data" empty-text="暂无数据" :row-class-name="tableRowClassName" :default-sort="{ prop: 'created_at', order: 'descending' } ">
      <el-table-column prop="created_at" :formatter="formatCreatedAt" label="录入时间" sortable />
      <el-table-column label="比赛等级" width="85" :formatter="formatMatchLevel" />
      <el-table-column label="1st">
        <el-table-column prop="record_1.player_name" label="玩家" />
        <el-table-column prop="record_1.rank" label="段位" width="75" :formatter="formatRank" />
        <el-table-column prop="record_1.points" label="分数" width="80" />
        <el-table-column prop="record_1.start_direction" label="起家" width="55" :formatter="formatStartDirection" />
      </el-table-column>
      <el-table-column label="2nd">
        <el-table-column prop="record_2.player_name" label="玩家" />
        <el-table-column prop="record_2.rank" label="段位" width="75" :formatter="formatRank" />
        <el-table-column prop="record_2.points" label="分数" width="80" />
        <el-table-column prop="record_2.start_direction" label="起家" width="55" :formatter="formatStartDirection" />
      </el-table-column>
      <el-table-column label="3rd">
        <el-table-column prop="record_3.player_name" label="玩家" />
        <el-table-column prop="record_3.rank" label="段位" width="75" :formatter="formatRank" />
        <el-table-column prop="record_3.points" label="分数" width="80" />
        <el-table-column prop="record_3.start_direction" label="起家" width="55" :formatter="formatStartDirection" />
      </el-table-column>
      <el-table-column label="4th">
        <el-table-column prop="record_4.player_name" label="玩家" />
        <el-table-column prop="record_4.rank" label="段位" width="75" :formatter="formatRank" />
        <el-table-column prop="record_4.points" label="分数" width="80" />
        <el-table-column prop="record_4.start_direction" label="起家" width="55" :formatter="formatStartDirection" />
      </el-table-column>
    </el-table>

  </div>
</template>

<style>
.el-table .danger-row {
  --el-table-tr-bg-color: var(--el-color-danger-light-9);
}
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}
.el-table .info-row {
  --el-table-tr-bg-color: var(--el-color-info-light-9);
}
.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}
</style>