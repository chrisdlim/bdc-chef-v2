export type CommandOptionsAutoCompleteConfig = {
  [option: string | number]: () => string[];
};
