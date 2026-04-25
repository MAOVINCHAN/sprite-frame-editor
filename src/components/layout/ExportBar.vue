<script setup>
import { inject } from "vue";
import { Copy, Download } from "lucide-vue-next";
import { SPRITE_EDITOR_KEY } from "../../composables/useSpriteEditor";

const editor = inject(SPRITE_EDITOR_KEY);
</script>

<template>
  <div class="export-bar">
    <button class="btn" type="button" @click="editor.copyJson">
      <Copy :size="16" />
      <span>复制 JSON</span>
    </button>
    <button class="btn btn-outline" type="button" @click="editor.downloadJson">
      <Download :size="16" />
      <span>下载</span>
    </button>
  </div>
</template>
