<script setup>
import { inject, ref } from "vue";
import { Folder, FolderOpen, Plus, Trash2 } from "lucide-vue-next";
import { SPRITE_EDITOR_KEY } from "../../composables/useSpriteEditor";

const editor = inject(SPRITE_EDITOR_KEY);
const newGroupName = ref("动作1");

function addGroup() {
  editor.addGroup(newGroupName.value);
  newGroupName.value = `动作${editor.groups.value.length + 1}`;
}
</script>

<template>
  <div class="tree-pane group-nav">
    <div class="tree-pane-header group-nav-header">
      <span>分组导航</span>
      <span class="badge">{{ editor.groups.value.length }}</span>
    </div>

    <div class="group-tree">
      <div v-if="!editor.groups.value.length" class="hint-text tab-empty">暂无分组</div>
      <div
        v-for="group in editor.groups.value"
        :key="group.id"
        class="group-tab"
        :class="{ active: group.id === editor.activeGroupId.value }"
        @click="editor.setActiveGroup(group.id)"
      >
        <FolderOpen v-if="group.id === editor.activeGroupId.value" class="group-icon" :size="16" />
        <Folder v-else class="group-icon" :size="16" />
        <button
          class="group-name-button"
          type="button"
          :aria-current="group.id === editor.activeGroupId.value ? 'page' : undefined"
          @click="editor.setActiveGroup(group.id)"
        >
          <span class="group-label">{{ group.name }}</span>
          <span class="hint-text">{{ group.frames.length }} 帧</span>
        </button>
        <button
          class="icon-button subtle-danger"
          type="button"
          title="删除分组"
          @click.stop="editor.deleteGroup(group.id)"
        >
          <Trash2 :size="14" />
        </button>
      </div>
    </div>

    <div class="explorer-actions explorer-actions-stacked">
      <input
        v-model="newGroupName"
        type="text"
        placeholder="新分组名称"
        @keydown.enter.prevent="addGroup"
      />
      <button class="btn btn-small" type="button" @click="addGroup">
        <Plus :size="14" />
        <span>创建</span>
      </button>
    </div>
  </div>
</template>
