<script setup>
import { inject } from "vue";
import { Ruler } from "lucide-vue-next";
import { SPRITE_EDITOR_KEY } from "../../composables/useSpriteEditor";

const editor = inject(SPRITE_EDITOR_KEY);

function applyFrameSize() {
  editor.setFrameSize(editor.frameW.value, editor.frameH.value);
}
</script>

<template>
  <section class="tool-card">
    <div class="tool-card-title">
      <Ruler :size="16" />
      <span>帧尺寸</span>
    </div>
    <div class="compact-row">
      <div class="field-stack">
        <label>宽</label>
        <input v-model="editor.frameW.value" type="number" min="1" max="2000" step="1" />
      </div>
      <div class="field-stack">
        <label>高</label>
        <input v-model="editor.frameH.value" type="number" min="1" max="2000" step="1" />
      </div>
      <button class="btn btn-small" type="button" @click="applyFrameSize">应用</button>
    </div>
  </section>
</template>
