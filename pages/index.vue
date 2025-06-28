<template>
  <div>
    <name-searcher v-model="inputtingName" @select="handleNameSelect" />
    <match-records-table v-if="selectingName" ref="matchRecordsTableRef" :name="selectingName" />
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();
const router = useRouter();

// 从路由参数初始化name值
const inputtingName = ref<string>((route.query.name as string) || '');
const selectingName = ref<string>((route.query.name as string) || '');

// 添加组件引用
const matchRecordsTableRef = ref();

// 处理name选择事件，更新路由参数
async function handleNameSelect(item: any) {
  const selectedName = item?.value || item;
  if (selectedName) {
    selectingName.value = selectedName;
    await router.push({query: {...route.query, name: selectedName}});
    // 触发 match-records-table 的 loadData 方法
    if (matchRecordsTableRef.value) {
      await matchRecordsTableRef.value.loadData();
    }
  }
}

onMounted(async () => {
  if (route.query.name) {
    await handleNameSelect(route.query.name);
  }
})
</script>

<style>

</style>