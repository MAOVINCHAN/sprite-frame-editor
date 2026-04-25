<template>
  <section class="panel-section">
    <div class="section-header">
      <span>资源浏览器</span>
    </div>
    <div class="explorer-shell">
      <GroupTabs />
      <FrameList />
    </div>
  </section>
</template>

<script setup>
import GroupTabs from "./GroupTabs.vue";
import FrameList from "./FrameList.vue";
</script>
