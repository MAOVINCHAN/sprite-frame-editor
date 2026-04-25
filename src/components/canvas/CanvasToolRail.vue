<script setup>
import { inject } from "vue";
import { Hand, Square } from "lucide-vue-next";
import { SPRITE_EDITOR_KEY } from "../../composables/useSpriteEditor";

const editor = inject(SPRITE_EDITOR_KEY);
</script>

<template>
  <div class="canvas-tools" aria-label="画布工具">
    <button
      class="tool-toggle"
      :class="{ active: editor.currentTool.value === 'move' }"
      type="button"
      title="移动工具"
      @click="editor.setActiveTool('move')"
    >
      <Hand :size="16" />
    </button>
    <button
      class="tool-toggle"
      :class="{ active: editor.currentTool.value === 'rect' }"
      type="button"
      title="矩形选框工具"
      @click="editor.setActiveTool('rect')"
    >
      <Square :size="16" />
    </button>
  </div>
</template>
