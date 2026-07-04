import { onMounted, onUnmounted } from "vue";
import type { ShallowRef } from "vue";
import Sortable from "sortablejs";
import type { SortableEvent } from "sortablejs";

interface SortableGroupOptions {
  group: string;
  handle: string;
  chosenClass: string;
  ghostClass: string;
  onEnd: (event: SortableEvent) => void;
}

export function useSortableGroup(
  target: Readonly<ShallowRef<HTMLElement | null>>,
  options: SortableGroupOptions,
) {
  let sortable: Sortable | null = null;

  onMounted(() => {
    if (!target.value) return;
    sortable = Sortable.create(target.value, {
      group: options.group,
      handle: options.handle,
      animation: 150,
      chosenClass: options.chosenClass,
      ghostClass: options.ghostClass,
      onEnd: options.onEnd,
    });
  });

  onUnmounted(() => {
    sortable?.destroy();
    sortable = null;
  });
}
