<template>
  <div v-if="players && players.length > 0" class="space-y-6">
    <!-- 电脑端表格版本 - 只在大屏幕上显示 -->
    <div class="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800">排行榜</h3>
        <span class="text-sm text-gray-500">共 {{ players.length }} 名玩家</span>
      </div>

      <!-- 玩家排名表格 -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                名次
              </th>
              <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                玩家
              </th>
              <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                段位
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(player, index) in sortedPlayers" :key="player._id"
                class="hover:bg-gray-50 transition-colors"
                :class="{'bg-gray-50': index % 2 !== 0 && index !== 0}">
              <td class="px-4 py-3 whitespace-nowrap">
                <!-- 名次展示，前三名有特殊样式 -->
                <div v-if="index < 3"
                     class="inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm"
                     :class="{
                       'bg-yellow-500': index === 0,
                       'bg-gray-400': index === 1,
                       'bg-amber-600': index === 2
                     }">
                  {{ index + 1 }}
                </div>
                <div v-else class="text-sm text-gray-900 font-medium pl-2">
                  {{ index + 1 }}
                </div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  <NuxtLink
                    :to="{path: route.path, query: { ...route.query, name: player.name }}"
                    class="hover:text-blue-500"
                  >
                    {{ player.name }}
                  </NuxtLink>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="mb-1 flex items-center">
                  <div class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: getRankColor(player.rank) }"></div>
                  <span class="text-sm font-medium" :style="{ color: getRankColor(player.rank) }">
                    {{ getRankChineseName(player.rank) }}
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 relative">
                  <div class="h-2.5 rounded-full"
                       :style="{ width: `${getProgress(player.rank, player.pt)}%`, backgroundColor: getRankColor(player.rank) }">
                  </div>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ player.pt }} / {{ getPromotionPt(player.rank) }} PT
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 移动端适配版本 - 在小屏幕上显示卡片式布局 -->
    <div class="lg:hidden space-y-3">
      <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800">排行榜</h3>
        <span class="text-sm text-gray-500">共 {{ players.length }} 名玩家</span>
      </div>

      <div v-for="(player, index) in sortedPlayers.slice(0, 10)" :key="player._id"
           class="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center"
           :class="{'border-yellow-300 shadow-yellow-100': index === 0}">
        <div v-if="index < 3"
             class="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm mr-3"
             :class="{
               'bg-yellow-500': index === 0,
               'bg-gray-400': index === 1,
               'bg-amber-600': index === 2
             }">
          {{ index + 1 }}
        </div>
        <div v-else class="flex-shrink-0 w-8 text-center font-medium text-gray-700 mr-3">
          {{ index + 1 }}
        </div>

        <div class="flex-grow">
          <div class="font-medium text-gray-900">
            <NuxtLink
              :to="{path: route.path, query: { ...route.query, name: player.name }}"
              class="hover:text-blue-500"
            >
              {{ player.name }}
            </NuxtLink>
          </div>
          <div class="flex items-center mt-1">
            <div class="w-2 h-2 rounded-full mr-1" :style="{ backgroundColor: getRankColor(player.rank) }"></div>
            <span class="text-xs font-medium" :style="{ color: getRankColor(player.rank) }">
              {{ getRankChineseName(player.rank) }}
            </span>
            <span class="text-xs text-gray-500 ml-2">
              {{ player.pt }}/{{ getPromotionPt(player.rank) }}
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
            <div class="h-1.5 rounded-full"
                 :style="{ width: `${getProgress(player.rank, player.pt)}%`, backgroundColor: getRankColor(player.rank) }">
            </div>
          </div>
        </div>
      </div>

      <div v-if="sortedPlayers.length > 10" class="text-center text-sm text-gray-500 mt-2">
        显示前10名玩家...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import { type Player } from '~/types/player'
import { getRankChineseName, RANK_ORDER, getPromotionPt, getInitialPt, Rank } from '~/utils/player-rank'

const route = useRoute()

const props = defineProps({
  players: {
    type: Array as PropType<Player[]>,
    required: true
  }
})

const sortedPlayers = computed(() => {
  return [...props.players].sort((a, b) => {
    const idxA = RANK_ORDER.indexOf(a.rank)
    const idxB = RANK_ORDER.indexOf(b.rank)
    if (idxA !== idxB) {
      return idxB - idxA
    }
    return b.pt - a.pt
  })
})

/** 计算进度百分比 */
const getProgress = (rank: Rank, pt: number): number => {
  const initial = getInitialPt(rank)
  const promotion = getPromotionPt(rank)
  const percent = ((pt - initial) / (promotion - initial)) * 100
  return percent > 100 ? 100 : percent
}

/** 根据段位返回对应颜色 */
const getRankColor = (rank: Rank): string => {
  if (rank.startsWith('novice')) return '#4CAF50'      // 更深的绿色，改进可读性
  if (rank.startsWith('practitioner')) return '#006400' // 深绿色
  if (rank.startsWith('expert')) return '#FFD700'      // 金黄色
  if (rank.startsWith('elite')) return '#FFA500'       // 橙黄色
  if (rank.startsWith('sage')) return '#FF0000'        // 红色
  return '#409EFF'
}
</script>

<style scoped>
/* 为移动端视图添加一些平滑过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 确保表格在所有设备上都有良好的显示 */
@media (max-width: 640px) {
  table {
    font-size: 0.875rem;
  }
}
</style>
