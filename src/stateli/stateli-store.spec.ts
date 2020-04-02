import { testValue, createModuleStore, createStore } from './helper.spec';
import { StateliStore } from './stateli-store';

describe('getters', () => {
  const store = createModuleStore(false, false, testValue);
  test('should return value when exists', () => {
    const result = store.getter('getter');
    expect(result).toBe(testValue);
  });
  test('should return undefined when not exists', () => {
    const result = store.getter('getter3');
    expect(result).toBeUndefined();
  });
});

describe('mutations', () => {
  const store = createModuleStore(false, false, '');
  test('should set value when mutation exists', () => {
    store.commit('mutation', testValue);
    const result = store.getter('getter');
    expect(result).toBe(testValue);
  });
  test('should do nothing when mutation not exists', () => {
    const origState = store.state.mod;
    store.commit('mutation3', 'some other value');
    expect(store.state.mod).toStrictEqual(origState);
  });
});

describe('actions', () => {
  test('should return promise of action result when action exists', async () => {
    const store = createModuleStore(false, false, '');
    const result = await store.dispatch('action', testValue);
    const val = store.getter('getter');
    expect(result).toBe(true);
    expect(val).toBe(testValue);
  });
  test('should return promise with null when action not exists', async () => {
    const store = createStore('');
    const result = await store.dispatch('action3', testValue);
    expect(result).toBeNull();
  });
  test('should require prefix when namespaced', async () => {
    const store = createModuleStore(false, true, '');
    const result = await store.dispatch('mod/action', testValue);
    const val = store.getter('mod/getter');
    expect(result).toBe(true);
    expect(val).toBe(testValue);
  });
  test('should chain actions appropriately', async () => {
    const action = {
      type: 'chainingAction',
      execute: async (ctx, payload) => {
        await ctx.dispatch('action', testValue);
        if (ctx.state.val === testValue) {
          ctx.commit('mutation2', payload);
        }
        return true;
      },
    };
    const store = createStore('', action);
    const result = await store.dispatch('chainingAction', 'another value');
    expect(result).toBe(true);
    expect(store.state.val).toBe(testValue);
    expect(store.state.val2).toBe('another value');
  });
  test('root state and module state should be in-sync', async () => {
    const action = {
      type: 'action2',
      execute: (ctx, payload) => {
        ctx.commit('mutation', payload);
        let success = ctx.rootState.mod.val === ctx.state.val && ctx.state.val === testValue;
        return Promise.resolve(success);
      },
    };
    const store = createModuleStore(false, false, '', action);
    const result = await store.dispatch('action2', testValue);
    expect(result).toBe(true);
  });
  test('should be able to access current and snapshot state', () => {
    const action = {
      type: 'action2',
      execute: (ctx, payload) => {
        return new Promise(resolve => {
          ctx.commit('mutation', payload);
          setTimeout(() => {
            const val = ctx.state.val;
            const rootVal = ctx.rootState.mod.val;
            const snapVal = ctx.snapshots.state.val;
            const snapRootVal = ctx.snapshots.rootState.mod.val;
            resolve({ val, rootVal, snapVal, snapRootVal });
          }, 100);
        });
      },
    };
    return new Promise(resolve => {
      const store = createModuleStore(false, false, '', action);
      store.dispatch('action', 'another value');
      const p1 = store.dispatch('action2', testValue);
      p1.then(x => {
        expect(x.val).toBe(x.rootVal);
        expect(x.snapVal).toBe(x.snapRootVal);
        expect(x.val).not.toBe(x.snapVal);
        expect(x.val).toBe(testValue);
        expect(x.snapVal).toBe('another value');
        resolve();
      });
    });
  });
});

describe('subscribe', () => {
  test('should fire on mutation', async () => {
    const store = createModuleStore(false, false, '');
    let val = '';
    store.subscribe(x => {
      if (x.type === 'mutation') {
        val = x.payload;
      }
    });
    await store.dispatch('action', testValue);
    expect(val).toBe(testValue);
  });
  test('should be able to access current state', async () => {
    return new Promise(resolve => {
      const store = createStore('');
      let val = '';
      const p = new Promise(r2 => {
        store.subscribe(x => {
          if (x.type === 'mutation') {
            if (x.payload === testValue) {
              setTimeout(() => {
                val = x.store.state.val;
                r2(val);
              }, 1);
            }
          }
        });
      });
      store.dispatch('action', testValue);
      store.dispatch('action', 'another value');
      p.then(x => {
        expect(x).toBe('another value');
        resolve();
      });
    });
  });
  test('should be able to access snapshot state', () => {
    return new Promise(resolve => {
      const store = createStore('');
      const p = new Promise(r2 => {
        store.subscribe(x => {
          if (x.type === 'mutation') {
            if (x.payload === testValue) {
              setTimeout(() => {
                const val = x.store.snapshot.val;
                r2(val);
              }, 1);
            }
          }
        });
      });
      store.dispatch('action', testValue);
      store.dispatch('action', 'another value');
      p.then(x => {
        expect(x).toBe(testValue);
        resolve();
      });
    });
  });
  test('should be able to dispatch action', () => {
    const action = {
      type: 'action2',
      execute: (ctx, payload) => {
        ctx.commit('mutation2', payload);
        return Promise.resolve(true);
      },
    };
    return new Promise(resolve => {
      const store = createStore('', action);
      store.subscribe(x => {
        if (x.type === 'mutation') {
          x.store.dispatch('action2', 'another value').then(() => {
            expect(store.state.val2).toBe('another value');
            resolve();
          });
        }
      });
      store.dispatch('action', testValue);
    });
  });
  test('should be able to commit mutation', () => {
    return new Promise(resolve => {
      const store = createStore('');
      store.subscribe(x => {
        if (x.type === 'mutation') {
          x.store.commit('mutation2', 'another value');
        }
        if (x.type === 'mutation2') {
          expect(store.state.val2).toBe('another value');
          resolve();
        }
      });
      store.dispatch('action', testValue);
    });
  });
  test('should be able to access getter', () => {
    return new Promise(resolve => {
      const store = createStore('');
      store.subscribe(x => {
        if (x.type === 'mutation') {
          const val = x.store.getter('getter');
          expect(val).toBe(testValue);
          resolve();
        }
      });
      store.dispatch('action', testValue);
    });
  });
});

describe('state', () => {
  test('should return value from initial state', () => {
    const store = createModuleStore(false, false, testValue);
    expect(store.state.mod.val).toBe(testValue);
  });
  test('should return updated value', () => {
    const store = createModuleStore(true, false, '');
    store.commit('mutation', testValue);
    expect(store.state.mod.val).toBe(testValue);
  });
});

describe('modules', () => {
  test('should default getters to empty array when not defined', () => {
    const store = new StateliStore({
      getters: undefined,
      actions: [],
      mutations: [],
      initialState: { val: '' },
    });
    expect(store.modules[0].getters).toStrictEqual([]);
  });
  test('should default actions to empty array when not defined', () => {
    const store = new StateliStore({
      getters: [],
      actions: undefined,
      mutations: [],
      initialState: { val: '' },
    });
    expect(store.modules[0].actions).toStrictEqual([]);
  });
  test('should default mutations to empty array when not defined', () => {
    const store = new StateliStore({
      getters: [],
      actions: [],
      mutations: undefined,
      initialState: { val: '' },
    });
    expect(store.modules[0].mutations).toStrictEqual([]);
  });
  test('should default state to empty object when not defined', () => {
    const store = new StateliStore({
      getters: [],
      actions: [],
      mutations: [],
      initialState: undefined,
    });
    expect(store.modules[0].state).toStrictEqual({});
  });
  test('should be able to access module state', () => {
    const store = createModuleStore(false, false, testValue);
    const mod = store.modules[1];
    expect(mod.state.val).toBe(testValue);
  });
});

test('no-modules', async () => {
  const store = createStore('');
  let val = '';
  store.subscribe(x => {
    if (x.type === 'mutation') {
      val = x.payload;
    }
  });
  await store.dispatch('action', testValue);
  const result = store.getter('getter');
  expect(val).toBe(testValue);
  expect(result).toBe(testValue);
});
