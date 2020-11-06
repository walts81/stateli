# Stateli

[![Build Status](https://travis-ci.com/walts81/stateli.svg?branch=master)](https://travis-ci.com/walts81/stateli)
[![Coverage Status](https://coveralls.io/repos/github/walts81/stateli/badge.svg)](https://coveralls.io/github/walts81/stateli)

Stateli is a state management library borrowing concepts from [Vuex][vuex] but with no reliance on [Vue][vue].

- State management using [Immutable][immutablejs]
- Asynchronous actions are dispatched
- Synchronous state mutations are committed
- Can be used with a single state or modules with individual states

### Installation

Install stateli with npm.

```sh
$ npm install stateli --save
```

### Usage (javascript)

```javascript
const { StateliStore } = require('stateli');

const someAction = {
  type: 'some_action_name',
  execute: (context, payload) => {
    // 1) do something
    const promise = fetch('get_some_value_from_api/' + payload);
    // 2) optionally commit to update state
    promise.then(val => {
      context.commit('some_mutation_name', val);
    });
    // 3) return a promise
    return promise;
  },
};

const someMutation = {
  type: 'some_mutation_name',
  commit: (state, payload) => {
    // We don't update the state directly but instead we create a shallow copy,
    // modify the copy and return it. Stateli will then replace the actual
    // state with the returned copy.
    const updatedState = { ...state, val: payload };
    return updatedState;
  },
};

const someGetter = {
  type: 'some_getter_name',
  getValue: state => state.val,
};

const initialState = { val: '' };

const store = new StateliStore({
  actions: [someAction],
  mutations: [someMutation],
  getters: [someGetter],
  initialState,
});

// dispatch an asynchronous action
store.dispatch('some_action_name', 'payload_value');

// commit a synchronous mutation
store.commit('some_mutation_name', 'payload_value');

// get value from getter
const val = store.getter('some_getter_name');

// access state
const val = store.state.val;
```

### Usage (typescript)

```typescript
import {
  StateliStore,
  IStateliModule,
  IStateliAction,
  IStateliMutation,
  IStateliGetter,
  IStateliContext,
} from 'stateli';

interface RootState {
  modA: ModuleAState;
}

interface ModuleAState {
  val: string;
}

const someAction: IStateliAction<RootState, ModuleAState, string> = {
  type: 'some_action_name',
  execute: (context: IStateliContext<RootState>, payload: string) => {
    // 1) do something
    const promise = fetch('get_some_value_from_api/' + payload);
    // 2) optionally commit to update state
    promise.then(val => {
      context.commit('some_mutation_name', val);
    });
    // 3) return a promise
    return promise;
  },
};

const someMutation: IStateliMutation<RootState, ModuleAState, string> = {
  type: 'some_mutation_name',
  commit: (state: ModuleAState, payload: string) => {
    const updatedState = { ...state, val: payload };
    return updatedState;
  },
};

const someGetter: IStateliGetter<ModuleAState> = {
  type: 'some_getter_name',
  getValue: (state: ModuleAState) => state.val,
};

const initialState: ModuleAState = { val: '' };
const modA: IStateliModule<RootState, ModuleAState> = {
  name: 'modA',
  state: initialState,
  actions: [someAction],
  mutations: [someMutation],
  getters: [someGetter],
};

const store = new StateliStore<RootState>({
  modules: [modA],
});

// dispatch an asynchronous action
store.dispatch('some_action_name', 'payload_value');

// commit a synchronous mutation
store.commit('some_mutation_name', 'payload_value');

// get value from getter
const val = store.getter('some_getter_name');

// access root state
const val = store.rootState.modA.val;
```

## License

[MIT](LICENSE)

[vue]: https://vuejs.org
[vuex]: https://vuex.vuejs.org
[immutablejs]: https://immutable-js.github.io/immutable-js/
