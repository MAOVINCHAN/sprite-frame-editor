import { computed, reactive, ref, shallowRef } from "vue";
import { useClipboard } from "@vueuse/core";

export const SPRITE_EDITOR_KEY = Symbol("sprite-editor");

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export function useSpriteEditor() {
  const { copy } = useClipboard();

  const imageElement = shallowRef(null);
  const imageName = ref("");
  const imgLoaded = ref(false);
  const imgNaturalWidth = ref(0);
  const imgNaturalHeight = ref(0);

  const frameW = ref(64);
  const frameH = ref(64);
  const snapGridSize = ref(10);
  const snapEnabled = ref(true);
  const currentTool = ref("move");
  const selection = reactive({
    x: 0,
    y: 0,
    active: false,
  });
  const activeFrameId = ref(null);

  let nextGroupId = 1;
  let nextFrameId = 1;

  const groups = ref([
    {
      id: `group_${nextGroupId++}`,
      name: "默认动作",
      frames: [],
    },
  ]);
  const activeGroupId = ref(groups.value[0].id);

  const activeGroup = computed(() =>
    groups.value.find((group) => group.id === activeGroupId.value) ?? groups.value[0] ?? null,
  );
  const totalFrames = computed(() =>
    groups.value.reduce((sum, group) => sum + group.frames.length, 0),
  );
  const selectedFrame = computed(
    () => activeGroup.value?.frames.find((frame) => frame.id === activeFrameId.value) ?? null,
  );
  const imageSummary = computed(() => {
    if (!imgLoaded.value) return "未上传图片";
    return `${imgNaturalWidth.value} × ${imgNaturalHeight.value}`;
  });
  const canExportJson = computed(() => imgLoaded.value && totalFrames.value > 0);

  function normalizePositiveInt(value, fallback = 1) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  function getSnapGridSize() {
    return normalizePositiveInt(snapGridSize.value, 10);
  }

  function snapPointToGrid(x, y, gridSize = getSnapGridSize()) {
    return {
      x: Math.max(0, Math.min(Math.round(x / gridSize) * gridSize, imgNaturalWidth.value)),
      y: Math.max(0, Math.min(Math.round(y / gridSize) * gridSize, imgNaturalHeight.value)),
    };
  }

  function snapToGrid(x, y, gridSize = getSnapGridSize()) {
    if (!imgLoaded.value) return { x, y };
    const snapped = snapPointToGrid(x, y, gridSize);
    return {
      x: Math.min(snapped.x, Math.max(0, imgNaturalWidth.value - frameW.value)),
      y: Math.min(snapped.y, Math.max(0, imgNaturalHeight.value - frameH.value)),
    };
  }

  function applySnapIfEnabled(x, y) {
    if (!imgLoaded.value) {
      return { x: Math.max(0, x), y: Math.max(0, y) };
    }
    if (snapEnabled.value) {
      return snapToGrid(x, y, getSnapGridSize());
    }
    return {
      x: Math.max(0, Math.min(x, imgNaturalWidth.value - frameW.value)),
      y: Math.max(0, Math.min(y, imgNaturalHeight.value - frameH.value)),
    };
  }

  function clampToImage(coord) {
    return {
      x: Math.max(0, Math.min(coord.x, imgNaturalWidth.value)),
      y: Math.max(0, Math.min(coord.y, imgNaturalHeight.value)),
    };
  }

  function clampSelection() {
    if (!imgLoaded.value) {
      selection.active = false;
      return;
    }
    selection.active = true;
    selection.x = Math.min(Math.max(0, selection.x), Math.max(0, imgNaturalWidth.value - frameW.value));
    selection.y = Math.min(Math.max(0, selection.y), Math.max(0, imgNaturalHeight.value - frameH.value));
  }

  function refreshSelectionPosition() {
    if (!imgLoaded.value) return;
    const snapped = applySnapIfEnabled(selection.x, selection.y);
    selection.x = snapped.x;
    selection.y = snapped.y;
    clampSelection();
  }

  function setSelection(x, y) {
    selection.x = x;
    selection.y = y;
    clampSelection();
  }

  function setFrameSize(width, height) {
    frameW.value = normalizePositiveInt(width, frameW.value);
    frameH.value = normalizePositiveInt(height, frameH.value);
    refreshSelectionPosition();
  }

  function setSnapGridValue(value) {
    snapGridSize.value = normalizePositiveInt(value, snapGridSize.value);
    refreshSelectionPosition();
  }

  function setSnapEnabled(value) {
    snapEnabled.value = Boolean(value);
    refreshSelectionPosition();
  }

  function setActiveTool(tool) {
    currentTool.value = tool === "rect" ? "rect" : "move";
  }

  async function handleImageUpload(file) {
    if (!file) return;
    const src = await readFileAsDataUrl(file);
    const image = await loadImage(src);
    imageElement.value = image;
    imageName.value = file.name;
    imgLoaded.value = true;
    imgNaturalWidth.value = image.width;
    imgNaturalHeight.value = image.height;
    selection.x = 0;
    selection.y = 0;
    clampSelection();
  }

  function addGroup(name) {
    const next = {
      id: `group_${nextGroupId++}`,
      name: name?.trim() || "新分组",
      frames: [],
    };
    groups.value = [...groups.value, next];
    activeGroupId.value = next.id;
  }

  function setActiveGroup(groupId) {
    activeGroupId.value = groupId;
    activeFrameId.value = null;
  }

  function deleteGroup(groupId) {
    if (groups.value.length <= 1) return;
    groups.value = groups.value.filter((group) => group.id !== groupId);
    if (activeGroupId.value === groupId) {
      activeGroupId.value = groups.value[0]?.id ?? null;
    }
    activeFrameId.value = null;
  }

  function captureCurrentFrame() {
    if (!imgLoaded.value || !activeGroup.value) return;
    clampSelection();
    const frame = {
      id: `frame_${nextFrameId++}`,
      name: `frame_${activeGroup.value.frames.length + 1}`,
      x: Math.round(selection.x),
      y: Math.round(selection.y),
      w: frameW.value,
      h: frameH.value,
    };
    activeGroup.value.frames.push(frame);
    activeFrameId.value = frame.id;
  }

  function generateAllGridFrames() {
    if (!imgLoaded.value || !activeGroup.value) return;
    const cols = Math.floor(imgNaturalWidth.value / frameW.value);
    const rows = Math.floor(imgNaturalHeight.value / frameH.value);
    if (!cols || !rows) return;

    const frames = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        frames.push({
          id: `frame_${nextFrameId++}`,
          name: `frame_${activeGroup.value.frames.length + frames.length + 1}`,
          x: col * frameW.value,
          y: row * frameH.value,
          w: frameW.value,
          h: frameH.value,
        });
      }
    }
    activeGroup.value.frames.push(...frames);
    activeFrameId.value = frames[0]?.id ?? null;
  }

  function clearCurrentGroupFrames() {
    if (!activeGroup.value) return;
    activeGroup.value.frames = [];
    activeFrameId.value = null;
  }

  function deleteFrame(frameId) {
    if (!activeGroup.value) return;
    activeGroup.value.frames = activeGroup.value.frames.filter((frame) => frame.id !== frameId);
    if (activeFrameId.value === frameId) {
      activeFrameId.value = activeGroup.value.frames[0]?.id ?? null;
    }
  }

  function reorderFrames(sourceId, targetId) {
    if (!activeGroup.value || sourceId === targetId) return;
    const sourceIndex = activeGroup.value.frames.findIndex((frame) => frame.id === sourceId);
    const targetIndex = activeGroup.value.frames.findIndex((frame) => frame.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const [moved] = activeGroup.value.frames.splice(sourceIndex, 1);
    activeGroup.value.frames.splice(targetIndex, 0, moved);
  }

  function selectFrame(frameId) {
    activeFrameId.value = frameId;
    const frame = activeGroup.value?.frames.find((item) => item.id === frameId);
    if (!frame) return;
    setSelection(frame.x, frame.y);
    setFrameSize(frame.w, frame.h);
  }

  function updateFrameName(frameId, name) {
    const frame = activeGroup.value?.frames.find((item) => item.id === frameId);
    if (!frame) return;
    frame.name = name?.trim() || frame.name;
  }

  function duplicateFrame(frameId) {
    const frame = activeGroup.value?.frames.find((item) => item.id === frameId);
    if (!frame || !activeGroup.value) return;
    const duplicate = {
      ...frame,
      id: `frame_${nextFrameId++}`,
      name: `${frame.name} 副本`,
    };
    const frameIndex = activeGroup.value.frames.findIndex((item) => item.id === frameId);
    activeGroup.value.frames.splice(frameIndex + 1, 0, duplicate);
    activeFrameId.value = duplicate.id;
  }

  function syncSelectionToActiveFrame() {
    const frame = selectedFrame.value;
    if (!frame) return;
    frame.x = Math.round(selection.x);
    frame.y = Math.round(selection.y);
    frame.w = frameW.value;
    frame.h = frameH.value;
  }

  function generateExportData() {
    return {
      meta: {
        image: imgLoaded.value ? imageName.value || "spritesheet.png" : "",
        frameWidth: frameW.value,
        frameHeight: frameH.value,
        snapGrid: getSnapGridSize(),
      },
      groups: groups.value.map((group) => ({
        name: group.name,
        frames: group.frames.map((frame) => ({
          name: frame.name,
          x: frame.x,
          y: frame.y,
          w: frame.w,
          h: frame.h,
        })),
      })),
    };
  }

  async function copyJson() {
    if (!canExportJson.value) return;
    await copy(JSON.stringify(generateExportData(), null, 2));
  }

  function downloadJson() {
    if (!canExportJson.value) return;
    const blob = new Blob([JSON.stringify(generateExportData(), null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `spritesheet_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return {
    imageElement,
    imageName,
    imgLoaded,
    imgNaturalWidth,
    imgNaturalHeight,
    frameW,
    frameH,
    snapGridSize,
    snapEnabled,
    currentTool,
    selection,
    groups,
    activeGroupId,
    activeGroup,
    activeFrameId,
    totalFrames,
    selectedFrame,
    imageSummary,
    canExportJson,
    getSnapGridSize,
    snapPointToGrid,
    snapToGrid,
    applySnapIfEnabled,
    clampToImage,
    clampSelection,
    refreshSelectionPosition,
    setSelection,
    setFrameSize,
    setSnapGridValue,
    setSnapEnabled,
    setActiveTool,
    handleImageUpload,
    addGroup,
    setActiveGroup,
    deleteGroup,
    captureCurrentFrame,
    generateAllGridFrames,
    clearCurrentGroupFrames,
    deleteFrame,
    reorderFrames,
    selectFrame,
    updateFrameName,
    duplicateFrame,
    syncSelectionToActiveFrame,
    generateExportData,
    copyJson,
    downloadJson,
  };
}
