import { type Ref, ref, computed } from 'vue';

export type SelectableConfig<T> = {
  idKey: keyof T | ((item: T) => string | number);
};

// Composable function to manage selectable items
export function useSelectable<T>(data: Ref<T[]>, config: SelectableConfig<T>) {
  const selected = ref<Set<string | number>>(new Set());

  // Computed property with getter and setter for allSelected
  const allSelected = computed(() => data.value.length > 0 && data.value.every((item) => isItemSelected(item)));

  // Function to get the key for an item based on config.idKey
  const getItemKey = (item: T): string | number => {
    if (typeof config.idKey === 'function') {
      return config.idKey(item);
    } else {
      return item[config.idKey] as unknown as string | number;
    }
  };

  // Function to select an item
  const selectItem = (item: T) => selected.value.add(getItemKey(item));
  const selectById = (id: string | number) => selected.value.add(id);

  // Function to check if an item is selected
  const isItemSelected = (item: T) => selected.value.has(getItemKey(item));
  const isSelectedById = (id: string | number) => selected.value.has(id);
  const isSubsetSelected = (items: T[]) => items.every((item) => isItemSelected(item));

  // Function to select all items
  const selectAll = () => data.value.forEach((item) => selectItem(item));

  // Function to deselect an item
  const deselectItem = (item: T) => selected.value.delete(getItemKey(item));
  const deselectById = (id: string | number) => selected.value.delete(id);

  // Function to deselect all items
  const deselectAll = () => {
    selected.value.clear();
  };

  // Function to toggle the selection of an item
  const toggleItemSelection = (item: T) => isItemSelected(item)
    ? deselectItem(item)
    : selectItem(item);
  const toggleSelectionById = (id: string | number) => isSelectedById(id)
    ? deselectById(id)
    : selectById(id);

  return {
    selected,
    allSelected,
    select: (item: T) => selectItem(item),
    selectById,
    isSelected: (item: T) => isItemSelected(item),
    isSelectedById,
    isSubsetSelected,
    selectAll,
    deselect: (item: T) => deselectItem(item),
    deselectById,
    deselectAll,
    toggle: (item: T) => toggleItemSelection(item),
    toggleById: toggleSelectionById,
  };
}
