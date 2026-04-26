import { computed, ref } from "vue";

export function useHistoryStack({ snapshot, restore, limit = 80 }) {
  const undoStack = ref([]);
  const redoStack = ref([]);
  const isRestoring = ref(false);

  const canUndo = computed(() => undoStack.value.length > 0);
  const canRedo = computed(() => redoStack.value.length > 0);

  function pushUndoState(state) {
    undoStack.value = [...undoStack.value, state].slice(-limit);
    redoStack.value = [];
  }

  function runWithHistory(action) {
    if (isRestoring.value) return action();
    const before = snapshot();
    const result = action();
    pushUndoState(before);
    return result;
  }

  function clearHistory() {
    undoStack.value = [];
    redoStack.value = [];
  }

  function undo() {
    if (!canUndo.value) return;
    const previous = undoStack.value.at(-1);
    const current = snapshot();
    undoStack.value = undoStack.value.slice(0, -1);
    redoStack.value = [...redoStack.value, current].slice(-limit);
    isRestoring.value = true;
    restore(previous);
    isRestoring.value = false;
  }

  function redo() {
    if (!canRedo.value) return;
    const next = redoStack.value.at(-1);
    const current = snapshot();
    redoStack.value = redoStack.value.slice(0, -1);
    undoStack.value = [...undoStack.value, current].slice(-limit);
    isRestoring.value = true;
    restore(next);
    isRestoring.value = false;
  }

  return {
    canUndo,
    canRedo,
    runWithHistory,
    clearHistory,
    undo,
    redo,
  };
}
