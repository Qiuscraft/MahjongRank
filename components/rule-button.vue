<template>
  <div>
    <!-- 规则按钮 -->
    <el-button
      type="primary"
      @click="showRuleDialog = true"
      class="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200"
    >
      查看规则
    </el-button>

    <!-- 规则弹窗 -->
    <el-dialog
      v-model="showRuleDialog"
      title="比赛规则"
      :width="'80%'"
      :max-width="'800px'"
      class="rule-dialog"
    >
      <div class="prose prose-sm max-w-none">
        <div class="bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto">
          <ContentRenderer v-if="ruleContent" :value="ruleContent" />
          <div v-else class="text-center text-gray-500">
            加载中...
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <el-button
            @click="showRuleDialog = false"
            class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            关闭
          </el-button>
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
