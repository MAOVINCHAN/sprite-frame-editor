<script setup>
import { inject } from "vue";
import { Hand, Redo2, Square, Undo2 } from "lucide-vue-next";
import { SPRITE_EDITOR_KEY } from "../../composables/useSpriteEditor";

const editor = inject(SPRITE_EDITOR_KEY);
</script>

<template>
  <div class="canvas-tools" aria-label="画布工具">
    <button
      class="tool-toggle"
      :class="{ active: editor.currentTool.value === 'move' }"
      type="button"
      aria-label="移动工具"
      data-tooltip="移动工具"
      @click="editor.setActiveTool('move')"
    >
      <Hand :size="16" />
    </button>
    <button
      class="tool-toggle"
      :class="{ active: editor.currentTool.value === 'rect' }"
      type="button"
      aria-label="矩形选区"
      data-tooltip="矩形选区"
      @click="editor.setActiveTool('rect')"
    >
      <Square :size="16" />
    </button>
    <span class="tool-separator" aria-hidden="true" />
    <button
      class="tool-toggle"
      type="button"
      aria-label="后退"
      data-tooltip="后退"
      :disabled="!editor.canUndo.value"
      @click="editor.undo"
    >
      <Undo2 :size="16" />
    </button>
    <button
      class="tool-toggle"
      type="button"
      aria-label="前进"
      data-tooltip="前进"
      :disabled="!editor.canRedo.value"
      @click="editor.redo"
    >
      <Redo2 :size="16" />
    </button>
  </div>
</template>
