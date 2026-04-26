<script setup>
import { inject } from "vue";
import { Upload } from "lucide-vue-next";
import { SPRITE_EDITOR_KEY } from "../../composables/useSpriteEditor";

const editor = inject(SPRITE_EDITOR_KEY);

function onFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  editor.handleImageUpload(file);
  event.target.value = "";
}
</script>

<template>
  <section class="tool-card">
    <div class="tool-card-title">
      <Upload :size="16" />
      <span>上传图片</span>
    </div>
    <input
      id="imageUpload"
      type="file"
      accept="image/png,image/jpeg,image/webp,image/gif"
      @change="onFileChange"
    />
    <div class="tool-note">支持 PNG、JPEG、WEBP、GIF</div>
  </section>
</template>
