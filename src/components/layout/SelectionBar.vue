<script setup>
import { inject } from "vue";
import { Hand, ScanSearch } from "lucide-vue-next";
import { SPRITE_EDITOR_KEY } from "../../composables/useSpriteEditor";

const editor = inject(SPRITE_EDITOR_KEY);
</script>

<template>
  <div class="selection-bar">
    <div class="hint-text">
      <kbd>拖拽</kbd>
      <span>/</span>
      <kbd>←↑↓→</kbd>
      <span>Shift + 10px</span>
    </div>
    <button class="btn" type="button" @click="editor.captureCurrentFrame">
      <Hand :size="16" />
      <span>记录当前帧</span>
    </button>
    <button class="btn btn-outline" type="button" @click="editor.generateAllGridFrames">
      <ScanSearch :size="16" />
      <span>生成全部网格帧</span>
    </button>
  </div>
</template>
