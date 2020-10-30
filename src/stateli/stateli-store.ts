import { List } from 'immutable';
import { IStateliStore } from './i-stateli-store';
import { IStateliModule } from './i-stateli-module';
import { IStateliModuleBase } from './i-stateli-module-base';
import { IStateliAction } from './i-stateli-action';
import { IStateliGetter } from './i-stateli-getter';
import { IStateliMutation } from './i-stateli-mutation';
import { IFunctionObserver } from './../observable/i-observer';
import { IStateliObservable } from './i-stateli-observable';
import { StateliSnapshotStore } from './stateli-snapshot-store';
import { StateliModule } from './stateli-module';
import { HasStringType } from './../has-type';
import { StateliSnapshotContext } from './stateli-snapshot-context';

const stateliRootModuleName = 'stateli_root';

interface Subscriber<RootState> {
  observer: IFunctionObserver<IStateliObservable<RootState>>;
  options?: { prepend: boolean };
}

export class StateliStore<RootState> implements IStateliStore<RootState> {
  private _modules: List<IStateliModule>;
  private _mutationSubscribers: Subscriber<RootState>[] = [];
  private _actionSubscribers: Subscriber<RootState>[] = [];

  get state() {
    if (this.isDefaultModule()) {
      return (this._modules.get(0) as any).state;
    }
    const s: any = {};
    for (const m of this._modules) {
      s[m.name] = m.state;
    }
    return s as RootState;
  }
  set state(s: RootState) {
    if (this.isDefaultModule()) {
      this._modules[0].state = s;
    } else {
      for (const mod of this._modules) {
        mod.state = s[mod.name];
      }
    }
  }

  get modules() {
    return this._modules.toArray();
  }

  constructor(config: {
    actions?: IStateliAction<RootState>[];
    mutations?: IStateliMutation<RootState>[];
    getters?: IStateliGetter<RootState>[];
    modules?: IStateliModuleBase[];
    initialState?: RootState;
  }) {
    this.reset(config);
  }

  asContext() {
    return new StateliSnapshotContext(x => x.state, this);
  }

  getter<Result = any>(type: string) {
    for (const mod of this._modules) {
      for (const getter of mod.getters) {
        if (this.getType(mod, getter) === type) {
          return getter.getValue(mod.state, this.getter.bind(this), this.state) as Result;
        }
      }
    }
    return undefined as any;
  }

  commit<Payload = any>(type: string, payload: Payload) {
    const currentStore = new StateliSnapshotStore(this);
    this._mutationSubscribers.slice()
      .filter(x => !!x.options && x.options.prepend)
      .forEach(sub => sub.observer({ type, payload, state: currentStore.snapshot, store: currentStore }));
    for (const mod of this._modules) {
      let found = false;
      for (const mutation of mod.mutations) {
        if (this.getType(mod, mutation) === type) {
          found = true;
          const updatedModuleState = mutation.commit(mod.state, payload);
          mod.state = updatedModuleState;
          const updatedStore = new StateliSnapshotStore(this);
          this._mutationSubscribers.slice()
            .filter(x => !x.options || !x.options.prepend)
            .forEach(sub => sub.observer({ type, payload, state: updatedStore.snapshot, store: updatedStore }));
          break;
        }
      }
      if (found) {
        break;
      }
    }
  }

  dispatch<Payload = any, Result = any>(type: string, payload: Payload) {
    const currentStore = new StateliSnapshotStore(this);
    this._actionSubscribers.slice()
      .filter(x => !!x.options && x.options.prepend)
      .forEach(sub => sub.observer({ type, payload, state: currentStore.snapshot, store: currentStore }));
    for (const mod of this._modules) {
      for (const action of mod.actions) {
        if (this.getType(mod, action) === type) {
          return action.execute(this.getContext(mod), payload).then(response => {
            const updatedStore = new StateliSnapshotStore(this);
            this._actionSubscribers.slice()
              .filter(x => !x.options || !x.options.prepend)
              .forEach(sub => sub.observer({ type, payload, state: updatedStore.snapshot, store: updatedStore }));
            return response;
          });
        }
      }
    }
    return Promise.resolve<Result>(null as any);
  }

  subscribeToMutation(observer: IFunctionObserver<IStateliObservable<RootState>>, options?: { prepend: boolean }) {
    return this.subscribe(this._mutationSubscribers, observer, options);
  }

  subscribeToAction(observer: IFunctionObserver<IStateliObservable<RootState>>, options?: { prepend: boolean }) {
    return this.subscribe(this._actionSubscribers, observer, options);
  }

  reset(config: {
    actions?: IStateliAction<RootState>[];
    mutations?: IStateliMutation<RootState>[];
    getters?: IStateliGetter<RootState>[];
    modules?: IStateliModuleBase[];
    initialState?: RootState;
  }) {
    const modules: IStateliModule[] = !!config.modules
      ? config.modules.map(x => new StateliModule(x))
      : [new StateliModule({
          name: stateliRootModuleName,
          namespaced: false,
          actions: config.actions || [],
          mutations: config.mutations || [],
          getters: config.getters || [],
          state: config.initialState || {}
        })];
    const immutableModules = modules.map(x => new StateliModule<any>(x));
    this._modules = List(immutableModules);
  }

  private subscribe(arr: Subscriber<RootState>[], observer: IFunctionObserver<IStateliObservable<RootState>>, options?: { prepend: boolean }) {
    const subscriber = arr.find(x => x.observer === observer);
    if (!subscriber) {
      arr.push({ observer, options });
    }
    return {
      unsubscribe: () => {
        const ix = arr.findIndex(x => x.observer === observer);
        if (ix > -1) {
          arr.splice(ix, 1);
        }
      }
    };
  }

  private isDefaultModule() {
    const count = this._modules.count();
    const firstMod = count === 1 ? this._modules.get(0) : (null as any);
    const modName = count === 1 ? firstMod.name : '';
    return modName === stateliRootModuleName;
  }

  private getType<T extends HasStringType>(mod: { name: string; namespaced?: boolean }, item: T) {
    return mod.namespaced ? `${mod.name}/${item.type}` : item.type;
  }

  private getContext<State>(mod: IStateliModule<State>) {
    return new StateliSnapshotContext<RootState, any>(
      x => (this.isDefaultModule() ? x.state : x.state[mod.name]),
      this
    );
  }
}
