<template>
  <section class="panel-section">
    <div class="section-header">
      <div>
        <span>资源浏览器</span>
        <p class="section-subtitle">管理动作组、帧顺序和命名</p>
      </div>
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
