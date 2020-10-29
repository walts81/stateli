import { StateliStore } from './stateli-store';

const testValue = 'test value';
const noopAction = { type: 'noopAction', execute: () => Promise.resolve() };
const createAction = (type: string, prefix: string) => {
  return {
    type,
    execute: (ctx, payload) => {
      return new Promise(resolve => {
        ctx.commit(`${prefix}mutation`, payload);
        resolve(true);
      });
    },
  };
};
const noopMutation = { type: 'noopMutation', commit: state => state };
const mutation = {
  type: 'mutation',
  commit: (state, payload) => {
    const updated = { ...state, val: payload };
    return updated;
  },
};
const mutation2 = {
  type: 'mutation2',
  commit: (state, payload) => {
    const updated = { ...state, val2: payload };
    return updated;
  },
};
const noopGetter = { type: 'noopGetter', getValue: state => state.val };
const getter = {
  type: 'getter',
  getValue: state => state.val,
};
const createModuleStore = (singleMod: boolean, namespaced: boolean, defaultStateVal: string, ...actions: any[]) => {
  const noopMod = {
    name: 'noopMod',
    namespaced: false,
    actions: [],
    mutations: [],
    getters: [],
    state: {},
  };
  const prefix = namespaced ? 'mod/' : '';
  const mod = {
    name: 'mod',
    namespaced,
    actions: [noopAction, createAction('action', prefix), ...actions],
    mutations: [noopMutation, mutation, mutation2],
    getters: [noopGetter, getter],
    state: { val: defaultStateVal, val2: '' },
  };
  const modules = singleMod ? [mod] : [noopMod, mod];
  return new StateliStore<any>({ modules });
};
const createStore = (defaultStateVal: string, ...actions: any[]) => {
  return new StateliStore<any>({
    actions: [noopAction, createAction('action', ''), createAction('action1', ''), createAction('action2', ''), ...actions],
    mutations: [noopMutation, mutation, mutation2],
    getters: [noopGetter, getter],
    initialState: { val: defaultStateVal, val2: '' },
  });
};

test('', () => expect(true).toBe(true));

export { createAction, createModuleStore, createStore, testValue };
