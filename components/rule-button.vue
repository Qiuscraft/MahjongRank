<template>
  <div>
    <!-- 规则按钮 - 与管理后台按钮风格保持一致 -->
    <button
      @click="showRuleDialog = true"
      class="inline-flex items-center px-2 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <svg class="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
      </svg>
      <span class="hidden sm:inline">查看规则</span>
      <span class="sm:hidden">规则</span>
    </button>

    <!-- 规则弹窗 -->
    <el-dialog
      v-model="showRuleDialog"
      title="比赛规则"
      :width="'40%'"
      :max-width="'800px'"
      class="rule-dialog"
    >
      <div class="prose prose-sm max-w-none">
        <div class="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg max-h-96 overflow-y-auto border border-blue-200">
          <ContentRenderer v-if="ruleContent" :value="ruleContent" />
          <div v-else class="text-center text-gray-500 py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            加载中...
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <button
            @click="showRuleDialog = false"
            class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            关闭
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
const showRuleDialog = ref(false)

const { data: ruleContent } = await useAsyncData('rule', () => {
  return queryCollection('content').path('/rule').first()
})
</script>

<style scoped>
@reference "tailwindcss";
/* 内容渲染样式 */
.prose {
  @apply text-gray-700 leading-relaxed;
}

.prose :deep(h1) {
  @apply text-xl font-bold text-gray-800 mb-4 mt-6;
}

.prose :deep(h2) {
  @apply text-lg font-semibold text-gray-800 mb-3 mt-5;
}

.prose :deep(h3) {
  @apply text-base font-medium text-gray-800 mb-2 mt-4;
}

.prose :deep(p) {
  @apply mb-3 text-sm;
}

.prose :deep(table) {
  @apply w-full border-collapse border border-gray-300 mb-4;
}

.prose :deep(th) {
  @apply bg-gray-100 border border-gray-300 px-3 py-2 text-left font-medium text-gray-800;
}

.prose :deep(td) {
  @apply border border-gray-300 px-3 py-2 text-sm;
}

.prose :deep(em) {
  @apply italic text-gray-600;
}

.prose :deep(strong) {
  @apply font-semibold text-gray-800;
}

.prose :deep(ul) {
  @apply list-disc list-inside mb-3;
}

.prose :deep(ol) {
  @apply list-decimal list-inside mb-3;
}

.prose :deep(li) {
  @apply mb-1 text-sm;
}
</style>
