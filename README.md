# Stateli

[![N|Solid](https://cldup.com/dTxpPi9lDf.thumb.png)](https://nodesource.com/products/nsolid)

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

Stateli is a state management library borrowing concepts from [Vuex][vuex] but with no reliance on [Vue][vue].

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
    const updatedState = { ...state, val: payload };
    return updatedState;
  },
};

const someGetter = {
  type: 'some_getter_name',
  getter: state => state.val,
};

const initialState = { val: '' };
const someModule = {
  name: 'modA',
  namespaced: false,
  state: initialState,
  actions: [someAction],
  mutations: [someMutation],
  getters: [someGetter],
};

const store = new StateliStore({
  modules: [someModule],
});

// dispatch an asynchronous action
store.dispatch('some_action_Name', 'payload_value');

// commit a synchronous mutation
store.commit('some_mutation_name', 'payload_value');

// get value from getter
const val = store.getter('some_getter_name');

// access root state
const val = store.rootState.modA.val;
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

const setBusyMutation: IStateliMutation<RootState, ModuleAState, string> = {
  type: 'some_mutation_name',
  commit: (state: ModuleAState, payload: string) => {
    const updatedState = { ...state, val: payload };
    return updatedState;
  },
};

const someGetter: IStateliGetter<ModuleAState> = {
  type: 'some_getter_name',
  getter: (state: ModuleAState) => state.val,
};

const initialState: ModuleAState = { val: '' };
const modA: IStateliModule<RootState, ModuleAState> = {
  name: 'modA',
  namespaced: false,
  state: initialState,
  actions: [someAction],
  mutations: [someMutation],
  getters: [someGetter],
};

const store = new StateliStore<RootState>({
  modules: [modA],
});

// dispatch an asynchronous action
store.dispatch('some_action_Name', 'payload_value');

// commit a synchronous mutation
store.commit('some_mutation_name', 'payload_value');

// get value from getter
const val = store.getter('some_getter_name');

// access root state
const val = store.rootState.modA.val;
```

## License

MIT

[vue]: https://vuejs.org
[vuex]: https://vuex.vuejs.org
