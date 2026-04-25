<script setup>
import { inject } from "vue";
import { SPRITE_EDITOR_KEY } from "../../composables/useSpriteEditor";

const editor = inject(SPRITE_EDITOR_KEY);

function onDragStart(event, frameId) {
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", frameId);
}

function onDrop(event, targetId) {
  event.preventDefault();
  const sourceId = event.dataTransfer.getData("text/plain");
  editor.reorderFrames(sourceId, targetId);
}
</script>

<template>
  <div class="tree-pane frame-tree">
    <div class="tree-pane-header">
      <span>当前分组帧</span>
      <span class="badge">{{ editor.activeGroup.value?.frames.length ?? 0 }}</span>
    </div>

    <div class="list-container frame-list">
      <div v-if="!(editor.activeGroup.value?.frames.length)" class="hint-text frame-empty">暂无帧</div>
      <div
        v-for="frame in editor.activeGroup.value?.frames ?? []"
        :key="frame.id"
        class="list-item"
        draggable="true"
        @dragstart="onDragStart($event, frame.id)"
        @dragover.prevent
        @drop="onDrop($event, frame.id)"
      >
        <span class="drag-handle">⋮⋮</span>
        <span class="tree-icon">•</span>
        <span class="tree-label">
          {{ frame.name }} ({{ frame.x }},{{ frame.y }}) {{ frame.w }}×{{ frame.h }}
        </span>
        <button type="button" @click="editor.deleteFrame(frame.id)">删除</button>
      </div>
    </div>

    <div class="explorer-actions">
      <button class="btn btn-outline btn-small" type="button" @click="editor.clearCurrentGroupFrames">
        清空当前分组帧
      </button>
    </div>
  </div>
</template>
