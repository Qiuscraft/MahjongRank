<script setup lang="ts">
import type {MatchRecord} from "~/types/match-record";
import { StartDirection } from "~/types/match-record";

const props = defineProps<{
  name: string
}>();

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
        name: props.name,
      },
    })
  } catch (error: any) {
    ElMessage.error(`获取比赛记录失败：${error.data.message || '未知错误。'}`);
  }
  sortInnerData();
}

// 暴露 loadData 方法给父组件
defineExpose({
  loadData
});

function mapStartDirection(direction: StartDirection): string {
  switch (direction) {
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

function formatCreatedAt(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function rowFormatCreatedAt(row: MatchRecord): string {
  return formatCreatedAt(row.created_at);
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
</script>

<template>
  <div>
    <el-table :data="data" empty-text="暂无数据" :row-class-name="tableRowClassName" :default-sort="{ prop: 'created_at', order: 'descending' } ">
      <el-table-column prop="created_at" :formatter="rowFormatCreatedAt" label="录入时间" sortable />
      <el-table-column label="1st">
        <el-table-column prop="record_1.player_name" label="玩家" />
        <el-table-column prop="record_1.points" label="分数" width="80" />
        <el-table-column label="起家" width="55">
          <template #default="scope">
            <div>
              {{mapStartDirection(scope.row.record_1.start_direction)}}
            </div>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="2nd">
        <el-table-column prop="record_2.player_name" label="玩家" />
        <el-table-column prop="record_2.points" label="分数" width="80" />
        <el-table-column label="起家" width="55">
          <template #default="scope">
            <div>
              {{mapStartDirection(scope.row.record_2.start_direction)}}
            </div>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="3rd">
        <el-table-column prop="record_3.player_name" label="玩家" />
        <el-table-column prop="record_3.points" label="分数" width="80" />
        <el-table-column label="起家" width="55">
          <template #default="scope">
            <div>
              {{mapStartDirection(scope.row.record_3.start_direction)}}
            </div>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="4th">
        <el-table-column prop="record_4.player_name" label="玩家" />
        <el-table-column prop="record_4.points" label="分数" width="80" />
        <el-table-column label="起家" width="55">
          <template #default="scope">
            <div>
              {{mapStartDirection(scope.row.record_4.start_direction)}}
            </div>
          </template>
        </el-table-column>
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