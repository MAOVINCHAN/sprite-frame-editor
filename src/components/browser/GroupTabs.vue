<script setup>
import { inject, ref } from "vue";
import { SPRITE_EDITOR_KEY } from "../../composables/useSpriteEditor";

const editor = inject(SPRITE_EDITOR_KEY);
const newGroupName = ref("动作1");

function addGroup() {
  editor.addGroup(newGroupName.value);
  newGroupName.value = `动作${editor.groups.value.length + 1}`;
}
</script>

<template>
  <div class="tree-pane">
    <div class="group-strip">
      <div v-if="!editor.groups.value.length" class="hint-text tab-empty">暂无分组</div>
      <div
        v-for="group in editor.groups.value"
        :key="group.id"
        class="group-tab"
        :class="{ active: group.id === editor.activeGroupId.value }"
      >
        <span class="tree-icon">▸</span>
        <button class="group-name-button" type="button" @click="editor.setActiveGroup(group.id)">
          {{ group.name }}
        </button>
        <span class="hint-text">{{ group.frames.length }}</span>
        <button type="button" @click="editor.deleteGroup(group.id)">删除</button>
      </div>
    </div>

    <div class="explorer-actions">
      <span class="badge">{{ editor.groups.value.length }}</span>
      <input
        v-model="newGroupName"
        type="text"
        placeholder="新分组名称"
        @keydown.enter.prevent="addGroup"
      />
      <button class="btn btn-small" type="button" @click="addGroup">创建</button>
    </div>
  </div>
</template>
