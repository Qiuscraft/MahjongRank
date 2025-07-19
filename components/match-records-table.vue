<script setup lang="ts">
import type {MatchRecord} from "~/types/match-record";
import { StartDirection, MatchType } from "~/types/match-record";
import type {TableColumnCtx} from "element-plus";
import {getRankChineseName} from "~/utils/player-rank";
import {determineMatchLevel, getMatchLevelChinese} from "~/utils/pt-calculator";

const props = defineProps<{
  name: string
  data: MatchRecord[]
}>();

// 添加响应式状态检测
const isMobile = ref(false)

// 监听窗口大小变化
onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

function checkScreenSize() {
  isMobile.value = window.innerWidth < 768 // md 断点
}

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

// 为卡片视图准备的格式化日期方法（包含时间）
function formatCreatedAtWithTime(dateString: string): string {
  const date = new Date(dateString);
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
    return 'primary-row'
  } else if (row.record_3.player_name === props.name) {
    return 'warning-row'
  } else if (row.record_4.player_name === props.name) {
    return 'danger-row'
  }
  return ''
}

// 获取卡片的背景色类
function getCardClass(record: MatchRecord): string {
  if (record.record_1.player_name === props.name) {
    return 'bg-green-50 border-green-200'
  } else if (record.record_2.player_name === props.name) {
    return 'bg-blue-50 border-blue-200'
  } else if (record.record_3.player_name === props.name) {
    return 'bg-yellow-50 border-yellow-200'
  } else if (record.record_4.player_name === props.name) {
    return 'bg-red-50 border-red-200'
  }
  return 'bg-white border-gray-200'
}

function formatRank(row: MatchRecord, column: TableColumnCtx<MatchRecord>, cellValue: Rank): string {
  return getRankChineseName(cellValue);
}

function formatMatchLevel(row: MatchRecord): string {
  const matchLevel = determineMatchLevel([row.record_1.rank, row.record_2.rank, row.record_3.rank, row.record_4.rank]);
  return getMatchLevelChinese(matchLevel);
}

// 格式化比赛类型
function formatMatchType(row: MatchRecord, column: TableColumnCtx<MatchRecord>, cellValue: MatchType): string {
  switch (cellValue) {
    case MatchType.East:
      return '东风场';
    case MatchType.South:
      return '南风场';
    default:
      return '';
  }
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

// 为卡片视图准备的PT样式
function getPtTextColor(recordPosition: number, playerName: string): string {
  if (playerName === props.name) {
    switch (recordPosition) {
      case 1:
        return 'text-green-600 font-bold';
      case 2:
        return 'text-blue-600 font-bold';
      case 3:
        return 'text-yellow-600 font-bold';
      case 4:
        return 'text-red-600 font-bold';
      default:
        return '';
    }
  }
  return playerName === props.name ? 'font-bold' : '';
}

// 获取相应位次的背景色
function getRankBgClass(position: number): string {
  switch (position) {
    case 1:
      return 'bg-green-100 text-green-800';
    case 2:
      return 'bg-blue-100 text-blue-800';
    case 3:
      return 'bg-yellow-100 text-yellow-800';
    case 4:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// 对比赛记录进行排序，按照创建时间降序
const sortedData = computed(() => {
  return [...props.data].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
});
</script>

<template>
  <div class="p-4">
    <!-- 桌面端表格视图 -->
    <div class="hidden md:block overflow-x-auto">
      <el-table
        :data="sortedData"
        empty-text="暂无数据"
        :row-class-name="tableRowClassName"
        class="w-full"
        header-row-class-name="bg-gray-50"
      >
        <el-table-column
          prop="created_at"
          :formatter="formatCreatedAt"
          label="录入时间"
          class-name="text-sm"
          width="110"
        />
        <el-table-column
          label="比赛等级"
          :formatter="formatMatchLevel"
          class-name="text-sm font-medium"
        />
        <el-table-column
          prop="match_type"
          :formatter="formatMatchType"
          label="比赛类型"
          class-name="text-sm font-medium"
        />

        <!-- 第1位 -->
        <el-table-column label="1位" header-align="center">
          <el-table-column prop="record_1.player_name" label="玩家" />
          <el-table-column prop="record_1.pt" label="PT" width="60" class-name="font-medium">
            <template #default="scope">
              <span :class="getPtClassForPlayer(1, scope.row.record_1.player_name)">{{ formatPt(scope.row, undefined, scope.row.record_1.pt) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="record_1.points" label="点数" class-name="font-medium"/>
        </el-table-column>

        <!-- 第2位 -->
        <el-table-column label="2位" header-align="center">
          <el-table-column prop="record_2.player_name" label="玩家" />
          <el-table-column prop="record_2.pt" label="PT" width="60" class-name="font-medium">
            <template #default="scope">
              <span :class="getPtClassForPlayer(2, scope.row.record_2.player_name)">{{ formatPt(scope.row, undefined, scope.row.record_2.pt) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="record_2.points" label="点数" class-name="font-medium"/>
        </el-table-column>

        <!-- 第3位 -->
        <el-table-column label="3位" header-align="center">
          <el-table-column prop="record_3.player_name" label="玩家" />
          <el-table-column prop="record_3.pt" label="PT" width="60" class-name="font-medium">
            <template #default="scope">
              <span :class="getPtClassForPlayer(3, scope.row.record_3.player_name)">{{ formatPt(scope.row, undefined, scope.row.record_3.pt) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="record_3.points" label="点数" class-name="font-medium"/>
        </el-table-column>

        <!-- 第4位 -->
        <el-table-column label="4位" header-align="center">
          <el-table-column prop="record_4.player_name" label="玩家" />
          <el-table-column prop="record_4.pt" label="PT" width="60" class-name="font-medium">
            <template #default="scope">
              <span :class="getPtClassForPlayer(4, scope.row.record_4.player_name)">{{ formatPt(scope.row, undefined, scope.row.record_4.pt) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="record_4.points" label="点数" class-name="font-medium"/>
        </el-table-column>
      </el-table>
    </div>

    <!-- 移动端卡片视图 -->
    <div class="md:hidden space-y-4">
      <div v-for="(record, index) in sortedData" :key="index"
           :class="`rounded-lg border p-4 shadow-sm ${getCardClass(record)}`">
        <!-- 卡片头部：日期和比赛等级 -->
        <div class="flex justify-between items-center mb-3">
          <div class="text-sm text-gray-600">{{ formatCreatedAtWithTime(record.created_at) }}</div>
          <div class="flex gap-2">
            <div class="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{{ formatMatchLevel(record) }}</div>
            <div class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">{{ formatMatchType(record, undefined, record.match_type) }}</div>
          </div>
        </div>

        <!-- 卡片内容：四位玩家 -->
        <div class="grid grid-cols-1 gap-3">
          <!-- 第1位 -->
          <div class="flex items-center justify-between border-b pb-2">
            <div class="flex items-center gap-2">
              <span :class="`inline-flex items-center px-2 py-1 text-xs rounded ${getRankBgClass(1)}`">1位</span>
              <span :class="record.record_1.player_name === props.name ? 'font-bold' : ''">{{ record.record_1.player_name }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-gray-600 text-sm w-14 text-right">{{ record.record_1.points }}</span>
              <span :class="`w-14 text-right ${getPtTextColor(1, record.record_1.player_name)}`">{{ formatPt(record, undefined, record.record_1.pt) }}</span>
            </div>
          </div>

          <!-- 第2位 -->
          <div class="flex items-center justify-between border-b pb-2">
            <div class="flex items-center gap-2">
              <span :class="`inline-flex items-center px-2 py-1 text-xs rounded ${getRankBgClass(2)}`">2位</span>
              <span :class="record.record_2.player_name === props.name ? 'font-bold' : ''">{{ record.record_2.player_name }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-gray-600 text-sm w-14 text-right">{{ record.record_2.points }}</span>
              <span :class="`w-14 text-right ${getPtTextColor(2, record.record_2.player_name)}`">{{ formatPt(record, undefined, record.record_2.pt) }}</span>
            </div>
          </div>

          <!-- 第3位 -->
          <div class="flex items-center justify-between border-b pb-2">
            <div class="flex items-center gap-2">
              <span :class="`inline-flex items-center px-2 py-1 text-xs rounded ${getRankBgClass(3)}`">3位</span>
              <span :class="record.record_3.player_name === props.name ? 'font-bold' : ''">{{ record.record_3.player_name }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-gray-600 text-sm w-14 text-right">{{ record.record_3.points }}</span>
              <span :class="`w-14 text-right ${getPtTextColor(3, record.record_3.player_name)}`">{{ formatPt(record, undefined, record.record_3.pt) }}</span>
            </div>
          </div>

          <!-- 第4位 -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span :class="`inline-flex items-center px-2 py-1 text-xs rounded ${getRankBgClass(4)}`">4位</span>
              <span :class="record.record_4.player_name === props.name ? 'font-bold' : ''">{{ record.record_4.player_name }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-gray-600 text-sm w-14 text-right">{{ record.record_4.points }}</span>
              <span :class="`w-14 text-right ${getPtTextColor(4, record.record_4.player_name)}`">{{ formatPt(record, undefined, record.record_4.pt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 没有数据时显示 -->
      <div v-if="sortedData.length === 0" class="text-center py-8 text-gray-500">
        暂无数据
      </div>
    </div>
  </div>
</template>

<style>
/* 仅在桌面端表格视图中使用的样式 */
@media (min-width: 768px) {
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
}
</style>