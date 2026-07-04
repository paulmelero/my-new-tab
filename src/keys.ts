import type { InjectionKey } from "vue";

export const OpenTaskKey: InjectionKey<(id: number) => void> = Symbol("openTask");
