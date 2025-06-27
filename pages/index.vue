<template>
  <div>
    <name-searcher v-model="name" @select="handleNameSelect" />
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();
const router = useRouter();

// 从路由参数初始化name值
const name = ref<string>((route.query.name as string) || '');

// 处理name选择事件，更新路由参数
function handleNameSelect(item: any) {
  const selectedName = item?.value || item;
  if (selectedName) {
    router.push({ query: { ...route.query, name: selectedName } });
  }
}
</script>

<style>

</style>