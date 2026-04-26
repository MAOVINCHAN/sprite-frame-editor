<script setup>
import { inject } from "vue";
import { Grid2x2 } from "lucide-vue-next";
import { SPRITE_EDITOR_KEY } from "../../composables/useSpriteEditor";

const editor = inject(SPRITE_EDITOR_KEY);
</script>

<template>
  <section class="tool-card">
    <div class="tool-card-title">
      <Grid2x2 :size="16" />
      <span>吸附网格</span>
    </div>
    <div class="compact-row compact-row-spread">
      <div class="field-stack">
        <label>大小</label>
        <input
          :value="editor.snapGridSize.value"
          type="number"
          min="5"
          max="2000"
          step="1"
          @change="editor.setSnapGridValue($event.target.value)"
        />
      </div>
      <label class="checkbox-row checkbox-row-inline">
        <input
          :checked="editor.snapEnabled.value"
          type="checkbox"
          @change="editor.setSnapEnabled($event.target.checked)"
        />
        <span>启用吸附</span>
      </label>
    </div>
  </section>
</template>
