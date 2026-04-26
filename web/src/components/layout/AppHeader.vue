<script setup>
import { inject } from "vue";
import { SPRITE_EDITOR_KEY } from "../../composables/useSpriteEditor";

const editor = inject(SPRITE_EDITOR_KEY);
</script>

<template>
  <header class="app-header">
    <div>
      <h1>雪碧图帧编辑器</h1>
      <span class="app-subtitle">更快整理动画帧、动作组和导出 JSON</span>
    </div>
    <div class="header-pill-row">
      <span class="header-pill header-pill-primary">{{ editor.imageSummary.value }}</span>
      <span class="header-pill">{{ editor.imageName.value || "等待上传图片" }}</span>
      <span class="header-pill">{{ editor.totalFrames.value }} 帧</span>
      <span class="header-pill">{{ editor.groups.value.length }} 分组</span>
      <span class="header-pill">选区 {{ editor.selection.x }}, {{ editor.selection.y }}</span>
    </div>
  </header>
</template>
