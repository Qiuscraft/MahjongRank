<script setup lang="ts">
import type {MatchRecord} from "~/types/match-record";
import { StartDirection } from "~/types/match-record";
import type {TableColumnCtx} from "element-plus";
import {getRankChineseName} from "~/utils/player-rank";
import {determineMatchLevel, getMatchLevelChinese} from "~/utils/pt-calculator";

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
  // return `${year}-${month}-${day} ${hours}:${minutes}`;
  return `${year}-${month}-${day}`;
}

const tableRowClassName = ({
                             row,
                           }: {
  row: MatchRecord
}) => {
  if (row.record_1.player_name === props.name) {
    return 'success-row'
  } else if (row.record_2.player_name === props.name) {
    return 'primary-row'
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

function formatPt(row: MatchRecord, column: TableColumnCtx<MatchRecord>, cellValue: number): string {
  return cellValue < 0 ? cellValue.toString() : `+${cellValue}`;
}

// 根据玩家名称和位次获取PT值对应的样式类
function getPtClassForPlayer(recordPosition: number, playerName: string): string {
  if (playerName === props.name) {
    switch (recordPosition) {
      case 1:
        return 'success-pt font-bold'; // success颜色
      case 2:
        return 'primary-pt font-bold';  // primary颜色
      case 3:
        return 'warning-pt font-bold'; // warning颜色
      case 4:
        return 'danger-pt font-bold';   // danger颜色
      default:
        return '';
    }
  }
  return '';
}
</script>

<template>
  <div class="p-4">
    <div class="overflow-x-auto">
      <el-table
        :data="data"
        empty-text="暂无数据"
        :row-class-name="tableRowClassName"
        :default-sort="{ prop: 'created_at', order: 'descending' }"
        class="w-full"
        header-row-class-name="bg-gray-50"
      >
        <el-table-column
          prop="created_at"
          :formatter="formatCreatedAt"
          label="录入时间"
          sortable
          class-name="text-sm"
          width="110"
        />
        <el-table-column
          label="比赛等级"
          :formatter="formatMatchLevel"
          class-name="text-sm font-medium"
        />

        <!-- 第1位 -->
        <el-table-column label="1位" header-align="center">
          <el-table-column prop="record_1.player_name" label="玩家" />
          <el-table-column prop="record_1.pt" label="PT" class-name="font-medium">
            <template #default="scope">
              <span :class="getPtClassForPlayer(1, scope.row.record_1.player_name)">{{ formatPt(scope.row, undefined, scope.row.record_1.pt) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="record_1.points" label="点数" class-name="font-medium"/>
        </el-table-column>

        <!-- 第2位 -->
        <el-table-column label="2位" header-align="center">
          <el-table-column prop="record_2.player_name" label="玩家" />
          <el-table-column prop="record_2.pt" label="PT" class-name="font-medium">
            <template #default="scope">
              <span :class="getPtClassForPlayer(2, scope.row.record_2.player_name)">{{ formatPt(scope.row, undefined, scope.row.record_2.pt) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="record_2.points" label="点数" class-name="font-medium"/>
        </el-table-column>

        <!-- 第3位 -->
        <el-table-column label="3位" header-align="center">
          <el-table-column prop="record_3.player_name" label="玩家" />
          <el-table-column prop="record_3.pt" label="PT" class-name="font-medium">
            <template #default="scope">
              <span :class="getPtClassForPlayer(3, scope.row.record_3.player_name)">{{ formatPt(scope.row, undefined, scope.row.record_3.pt) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="record_3.points" label="点数" class-name="font-medium"/>
        </el-table-column>

        <!-- 第4位 -->
        <el-table-column label="4位" header-align="center">
          <el-table-column prop="record_4.player_name" label="玩家" />
          <el-table-column prop="record_4.pt" label="PT" class-name="font-medium">
            <template #default="scope">
              <span :class="getPtClassForPlayer(4, scope.row.record_4.player_name)">{{ formatPt(scope.row, undefined, scope.row.record_4.pt) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="record_4.points" label="点数" class-name="font-medium"/>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style>
.el-table .danger-row {
  --el-table-tr-bg-color: var(--el-color-danger-light-9);
}
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}
.el-table .primary-row {
  --el-table-tr-bg-color: var(--el-color-primary-light-9);
}
.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}
.el-table .danger-pt {
  color: var(--el-color-danger);
}
.el-table .warning-pt {
  color: var(--el-color-warning);
}
.el-table .primary-pt {
  color: var(--el-color-primary);
}
.el-table .success-pt {
  color: var(--el-color-success);
}
</style>