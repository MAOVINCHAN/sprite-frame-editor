<script setup>
import { inject } from "vue";
import { Hand, ScanSearch } from "lucide-vue-next";
import { SPRITE_EDITOR_KEY } from "../../composables/useSpriteEditor";

const editor = inject(SPRITE_EDITOR_KEY);
</script>

<template>
  <div class="selection-bar">
    <div class="selection-stats">
      <span class="selection-stat"><strong>X</strong>{{ editor.selection.x }}</span>
      <span class="selection-stat"><strong>Y</strong>{{ editor.selection.y }}</span>
      <span class="selection-stat"><strong>W</strong>{{ editor.frameW.value }}</span>
      <span class="selection-stat"><strong>H</strong>{{ editor.frameH.value }}</span>
    </div>
    <div class="hint-text selection-shortcuts">
      <kbd>拖拽</kbd>
      <span>/</span>
      <kbd>←↑↓→</kbd>
      <span>Shift + 10px</span>
    </div>
    <button class="btn" type="button" @click="editor.captureCurrentFrame">
      <Hand :size="16" />
      <span>{{ editor.selectedFrame.value ? "新增一帧" : "记录当前帧" }}</span>
    </button>
    <button
      v-if="editor.selectedFrame.value"
      class="btn btn-soft"
      type="button"
      @click="editor.syncSelectionToActiveFrame"
    >
      <span>覆盖当前帧</span>
    </button>
    <button class="btn btn-outline" type="button" @click="editor.toggleGridFrames">
      <ScanSearch :size="16" />
      <span>{{ editor.activeGroupHasFrames.value ? "取消全部网格帧" : "生成全部网格帧" }}</span>
    </button>
  </div>
</template>
