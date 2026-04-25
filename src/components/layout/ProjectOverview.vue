<script setup>
import { inject } from "vue";
import { SPRITE_EDITOR_KEY } from "../../composables/useSpriteEditor";

const editor = inject(SPRITE_EDITOR_KEY);
</script>

<template>
  <section class="overview-strip">
    <span class="overview-title">精灵帧提取工作台</span>
    <div class="overview-tags">
      <span class="overview-tag overview-tag-primary">{{ editor.imageSummary.value }}</span>
      <span class="overview-tag">{{ editor.imageName.value || "等待上传图片" }}</span>
      <span class="overview-tag">{{ editor.totalFrames.value }} 帧</span>
      <span class="overview-tag">{{ editor.groups.value.length }} 分组</span>
      <span class="overview-tag">选区 {{ editor.selection.x }}, {{ editor.selection.y }}</span>
    </div>
  </section>
</template>
