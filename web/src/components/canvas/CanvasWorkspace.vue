<script setup>
import { computed, inject, nextTick, onMounted, ref, watch, watchEffect } from "vue";
import { useEventListener, useResizeObserver } from "@vueuse/core";
import CanvasToolRail from "./CanvasToolRail.vue";
import { SPRITE_EDITOR_KEY } from "../../composables/useSpriteEditor";

const editor = inject(SPRITE_EDITOR_KEY);

const wrapperRef = ref(null);
const canvasRef = ref(null);

const scale = ref(1);
const drawWidth = ref(0);
const drawHeight = ref(0);
const isDragging = ref(false);
const dragOffsetX = ref(0);
const dragOffsetY = ref(0);
const rectSelectStart = ref(null);

const cursorStyle = computed(() => (editor.currentTool.value === "move" ? "grab" : "crosshair"));

function fitCanvasToImage() {
  const canvas = canvasRef.value;
  const wrapper = wrapperRef.value;
  if (!canvas || !wrapper) return;

  if (!editor.imgLoaded.value || !editor.imageElement.value) {
    canvas.width = Math.max(1, wrapper.clientWidth - 48);
    canvas.height = Math.max(1, wrapper.clientHeight - 24);
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
    return;
  }

  const width = Math.max(1, wrapper.clientWidth);
  const height = Math.max(1, wrapper.clientHeight);
  const usableWidth = Math.max(1, width - 48);
  const usableHeight = Math.max(1, height - 24);
  const imageScaleX = usableWidth / editor.imgNaturalWidth.value;
  const imageScaleY = usableHeight / editor.imgNaturalHeight.value;

  scale.value = Math.min(imageScaleX, imageScaleY);
  drawWidth.value = editor.imgNaturalWidth.value * scale.value;
  drawHeight.value = editor.imgNaturalHeight.value * scale.value;
  canvas.width = Math.max(1, Math.round(drawWidth.value));
  canvas.height = Math.max(1, Math.round(drawHeight.value));
  canvas.style.width = `${canvas.width}px`;
  canvas.style.height = `${canvas.height}px`;
}

function drawPlaceholder() {
  const canvas = canvasRef.value;
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f5f5f7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(29, 29, 31, 0.48)";
  ctx.font = '17px "SF Pro Text", system-ui, sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("暂无图片", canvas.width / 2, canvas.height / 2);
}

function redrawCanvas() {
  const canvas = canvasRef.value;
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return;

  fitCanvasToImage();

  if (!editor.imgLoaded.value || !editor.imageElement.value) {
    drawPlaceholder();
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(editor.imageElement.value, 0, 0, drawWidth.value, drawHeight.value);

  if (editor.snapEnabled.value) {
    const grid = editor.getSnapGridSize() * scale.value;
    if (grid >= 8) {
      ctx.save();
      ctx.strokeStyle = "rgba(17, 24, 39, 0.08)";
      ctx.lineWidth = 1;
      for (let x = grid; x < canvas.width; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = grid; y < canvas.height; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  editor.groups.value.forEach((group) => {
    const active = group.id === editor.activeGroupId.value;
    group.frames.forEach((frame) => {
      const sx = frame.x * scale.value;
      const sy = frame.y * scale.value;
      const sw = frame.w * scale.value;
      const sh = frame.h * scale.value;
      const highlighted = frame.id === editor.activeFrameId.value;
      ctx.strokeStyle = highlighted ? "#f97316" : active ? "#0066cc" : "rgba(29, 29, 31, 0.46)";
      ctx.lineWidth = highlighted ? 3 : active ? 2.5 : 1.5;
      ctx.strokeRect(sx, sy, sw, sh);
      ctx.fillStyle = highlighted
        ? "rgba(249, 115, 22, 0.14)"
        : active
          ? "rgba(0, 102, 204, 0.08)"
          : "rgba(29, 29, 31, 0.05)";
      ctx.fillRect(sx, sy, sw, sh);
    });
  });

  editor.clampSelection();
  if (editor.selection.active) {
    const sx = editor.selection.x * scale.value;
    const sy = editor.selection.y * scale.value;
    const sw = editor.frameW.value * scale.value;
    const sh = editor.frameH.value * scale.value;
    ctx.strokeStyle = "#2997ff";
    ctx.lineWidth = 3;
    ctx.strokeRect(sx, sy, sw, sh);
    ctx.fillStyle = "rgba(41, 151, 255, 0.12)";
    ctx.fillRect(sx, sy, sw, sh);
  }
}

function mouseToOriginal(event) {
  const canvas = canvasRef.value;
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  const cx = (event.clientX - rect.left) * (canvas.width / rect.width);
  const cy = (event.clientY - rect.top) * (canvas.height / rect.height);
  return {
    x: cx / scale.value,
    y: cy / scale.value,
  };
}

function onPointerDown(event) {
  if (!editor.imgLoaded.value) return;
  const coord = editor.clampToImage(mouseToOriginal(event));

  if (editor.currentTool.value === "rect") {
    editor.beginCanvasOperation();
    isDragging.value = true;
    rectSelectStart.value = editor.snapEnabled.value
      ? editor.snapPointToGrid(coord.x, coord.y, editor.getSnapGridSize())
      : coord;
    editor.setSelection(rectSelectStart.value.x, rectSelectStart.value.y);
    redrawCanvas();
    return;
  }

  if (
    coord.x >= editor.selection.x &&
    coord.x <= editor.selection.x + editor.frameW.value &&
    coord.y >= editor.selection.y &&
    coord.y <= editor.selection.y + editor.frameH.value
  ) {
    editor.beginCanvasOperation();
    isDragging.value = true;
    dragOffsetX.value = coord.x - editor.selection.x;
    dragOffsetY.value = coord.y - editor.selection.y;
  }
}

function onPointerMove(event) {
  if (!isDragging.value) return;
  event.preventDefault();
  const coord = editor.clampToImage(mouseToOriginal(event));

  if (editor.currentTool.value === "rect" && rectSelectStart.value) {
    const current = editor.snapEnabled.value
      ? editor.snapPointToGrid(coord.x, coord.y, editor.getSnapGridSize())
      : coord;
    const minX = Math.min(rectSelectStart.value.x, current.x);
    const minY = Math.min(rectSelectStart.value.y, current.y);
    const rawW = Math.abs(current.x - rectSelectStart.value.x);
    const rawH = Math.abs(current.y - rectSelectStart.value.y);

    if (rawW > 0 && rawH > 0) {
      const nextWidth = editor.snapEnabled.value
        ? Math.max(editor.getSnapGridSize(), Math.round(rawW / editor.getSnapGridSize()) * editor.getSnapGridSize())
        : Math.max(1, Math.round(rawW));
      const nextHeight = editor.snapEnabled.value
        ? Math.max(editor.getSnapGridSize(), Math.round(rawH / editor.getSnapGridSize()) * editor.getSnapGridSize())
        : Math.max(1, Math.round(rawH));

      editor.setFrameSize(nextWidth, nextHeight, { recordHistory: false });
      editor.setSelection(
        Math.min(minX, Math.max(0, editor.imgNaturalWidth.value - editor.frameW.value)),
        Math.min(minY, Math.max(0, editor.imgNaturalHeight.value - editor.frameH.value)),
      );
    }
    redrawCanvas();
    return;
  }

  const nx = coord.x - dragOffsetX.value;
  const ny = coord.y - dragOffsetY.value;
  const snapped = editor.applySnapIfEnabled(nx, ny);
  editor.setSelection(snapped.x, snapped.y);
  redrawCanvas();
}

function onPointerUp() {
  const wasDragging = isDragging.value;
  isDragging.value = false;
  rectSelectStart.value = null;
  if (wasDragging) {
    editor.syncSelectionToActiveFrame();
    editor.commitCanvasOperation();
  } else {
    editor.cancelCanvasOperation();
  }
}

function isEditableTarget(target) {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
}

function onKeyDown(event) {
  const key = event.key.toLowerCase();
  const modifierPressed = event.metaKey || event.ctrlKey;

  if (!isEditableTarget(event.target) && modifierPressed && key === "z") {
    event.preventDefault();
    if (event.shiftKey) {
      editor.redo();
    } else {
      editor.undo();
    }
    redrawCanvas();
    return;
  }

  if (!isEditableTarget(event.target) && modifierPressed && key === "y") {
    event.preventDefault();
    editor.redo();
    redrawCanvas();
    return;
  }

  if (isEditableTarget(event.target)) return;
  if (!editor.imgLoaded.value) return;
  const step = event.shiftKey ? 10 : 1;
  let nx = editor.selection.x;
  let ny = editor.selection.y;

  if (event.key === "ArrowLeft") {
    nx -= step;
  } else if (event.key === "ArrowRight") {
    nx += step;
  } else if (event.key === "ArrowUp") {
    ny -= step;
  } else if (event.key === "ArrowDown") {
    ny += step;
  } else {
    return;
  }

  event.preventDefault();
  editor.beginCanvasOperation();
  const snapped = editor.applySnapIfEnabled(nx, ny);
  editor.setSelection(snapped.x, snapped.y);
  editor.commitCanvasOperation();
  redrawCanvas();
}

watch(
  () => [
    editor.imgLoaded.value,
    editor.imageName.value,
    editor.frameW.value,
    editor.frameH.value,
    editor.selection.x,
    editor.selection.y,
    editor.currentTool.value,
    editor.groups.value.map((group) => `${group.id}:${group.frames.map((frame) => `${frame.id}-${frame.x}-${frame.y}-${frame.w}-${frame.h}`).join(",")}`).join("|"),
  ],
  () => nextTick(redrawCanvas),
  { immediate: true },
);

watchEffect(() => {
  if (canvasRef.value) {
    canvasRef.value.style.cursor = cursorStyle.value;
  }
});

useEventListener(window, "mousemove", onPointerMove);
useEventListener(window, "mouseup", onPointerUp);
useEventListener(window, "keydown", onKeyDown);
useResizeObserver(wrapperRef, () => redrawCanvas());

onMounted(() => {
  redrawCanvas();
});
</script>

<template>
  <div ref="wrapperRef" class="canvas-wrapper">
    <CanvasToolRail />
    <div v-if="editor.selectedFrame.value" class="canvas-selection-chip">
      <span>当前帧</span>
      <strong>{{ editor.selectedFrame.value.name }}</strong>
    </div>
    <div v-if="!editor.imgLoaded.value" class="canvas-empty-tip">
      <strong>先上传一张雪碧图</strong>
      <span>上传后可拖拽选区、矩形框选、批量生成网格帧。</span>
    </div>
    <canvas ref="canvasRef" class="preview-canvas" @mousedown="onPointerDown" />
  </div>
</template>
