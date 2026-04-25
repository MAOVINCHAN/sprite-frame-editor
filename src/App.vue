<script setup>
import { provide } from "vue";
import AppHeader from "./components/layout/AppHeader.vue";
import SelectionBar from "./components/layout/SelectionBar.vue";
import ExportBar from "./components/layout/ExportBar.vue";
import CanvasWorkspace from "./components/canvas/CanvasWorkspace.vue";
import UploadCard from "./components/cards/UploadCard.vue";
import FrameSizeCard from "./components/cards/FrameSizeCard.vue";
import SnapGridCard from "./components/cards/SnapGridCard.vue";
import ResourceBrowser from "./components/browser/ResourceBrowser.vue";
import { SPRITE_EDITOR_KEY, useSpriteEditor } from "./composables/useSpriteEditor";

const editor = useSpriteEditor();
provide(SPRITE_EDITOR_KEY, editor);
</script>

<template>
  <div class="app-shell">
    <section class="main-area">
      <AppHeader />
      <CanvasWorkspace />
      <SelectionBar />
      <div class="toolbar">
        <UploadCard />
        <FrameSizeCard />
        <SnapGridCard />
      </div>
    </section>

    <aside class="side-panel">
      <ExportBar />
      <ResourceBrowser />
    </aside>
  </div>
</template>
