import type { InjectionKey, Ref } from 'vue'

export const railCollapsedKey: InjectionKey<Readonly<Ref<boolean>>> = Symbol('ds-rail-collapsed')
