import { type Ref, ref, computed, watch } from 'vue';
import { type Path } from '../types';
import { get as _get, filter as _filter } from 'lodash';

export type SelectableConfig<T> = {
  key: Path<T>;
};

// TODO: Need to allow user to manipulate allSelected without it actually selecting all.
// TODO: Need to programmatically select/deselect all based on the dataset's values/length.
// NOTE: The above TODOs should be accomplished without maniuplating the array values directly
// via some arbitrary object property like `_selected`.
export function useSelectable<T>(data: Ref<T[]>, config: SelectableConfig<T>) {
  const selected = ref<(string | number)[]>([]);

  const allSelected = computed({
    get: () => data.value.length === selected.value.length,
    set: (value) => value ? selectAll() : deselectAll(),
  });

  watch(data, () => {
    selected.value = _filter(selected.value, (key) => {
      return data.value.some((item) => _get(item, config.key) === key);
    });

    // Ensure that `allSelected` is updated.
    if (allSelected.value) selectAll();
  });

  // Need to ensure that they `key` type is a string key of `T`.
  const select = (keyVal: string | number) => isSelected(keyVal) || selected.value.push(keyVal);
  const isSelected = (keyVal: string | number) => selected.value.includes(keyVal);
  const selectAll = () =>
    data.value.forEach((item) => select(_get(item, config.key)));

  const deselect = (keyVal: string | number) =>
    selected.value = _filter(selected.value, (k) => k !== keyVal);
  const deselectAll = () => (selected.value = []);

  const toggle = (keyVal: string | number) => isSelected(keyVal) ? deselect(keyVal) : select(keyVal);

  return {
    selected,
    allSelected,
    select,
    isSelected,
    selectAll,
    deselect,
    deselectAll,
    toggle,
  };
}
