<script setup>
import { inject } from "vue";
import { Copy, GripVertical, Trash2 } from "lucide-vue-next";
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
    <div class="frame-list-header">
      <div>
        <span class="context-label">当前分组</span>
        <h3>{{ editor.activeGroup.value?.name || "未选择分组" }}</h3>
      </div>
      <div class="frame-list-meta">
        <span class="badge">{{ editor.activeGroup.value?.frames.length ?? 0 }} 帧</span>
        <span v-if="editor.selectedFrame.value" class="badge badge-active-frame">
          当前帧 {{ editor.selectedFrame.value.name }}
        </span>
      </div>
    </div>

    <div class="list-container frame-list">
      <div v-if="!(editor.activeGroup.value?.frames.length)" class="hint-text frame-empty">暂无帧</div>
      <div v-else class="frame-table-head">
        <span />
        <span>#</span>
        <span>名称</span>
        <span>坐标</span>
        <span>尺寸</span>
        <span>操作</span>
      </div>
      <div
        v-for="(frame, index) in editor.activeGroup.value?.frames ?? []"
        :key="frame.id"
        class="frame-row"
        :class="{ active: frame.id === editor.activeFrameId.value }"
        draggable="true"
        @dragstart="onDragStart($event, frame.id)"
        @dragover.prevent
        @drop="onDrop($event, frame.id)"
      >
        <span class="drag-handle" title="拖拽排序">
          <GripVertical :size="15" />
        </span>
        <button class="frame-index" type="button" @click="editor.selectFrame(frame.id)">
          {{ index + 1 }}
        </button>
        <input
          class="frame-name-input"
          :value="frame.name"
          type="text"
          maxlength="40"
          @focus="editor.selectFrame(frame.id)"
          @change="editor.updateFrameName(frame.id, $event.target.value)"
        />
        <button class="frame-cell-button" type="button" @click="editor.selectFrame(frame.id)">
          {{ frame.x }}, {{ frame.y }}
        </button>
        <button class="frame-cell-button" type="button" @click="editor.selectFrame(frame.id)">
          {{ frame.w }} x {{ frame.h }}
        </button>
        <div class="frame-actions">
          <button
            class="icon-button"
            type="button"
            title="复制帧"
            @click="editor.duplicateFrame(frame.id)"
          >
            <Copy :size="14" />
          </button>
          <button
            class="icon-button subtle-danger"
            type="button"
            title="删除帧"
            @click="editor.deleteFrame(frame.id)"
          >
            <Trash2 :size="14" />
          </button>
        </div>
      </div>
    </div>

    <div class="explorer-actions">
      <button class="btn btn-outline btn-small" type="button" @click="editor.clearCurrentGroupFrames">
        清空当前分组帧
      </button>
    </div>
  </div>
</template>
