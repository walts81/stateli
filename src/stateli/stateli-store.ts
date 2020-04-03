import { List } from 'immutable';
import { IStateliStore } from './i-stateli-store';
import { IStateliModule } from './i-stateli-module';
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

export class StateliStore<RootState> implements IStateliStore<RootState> {
  private _modules: List<IStateliModule>;
  private _subscribers: any[] = [];

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
    modules?: IStateliModule[];
    initialState?: RootState;
  }) {
    const modules = !!config.modules
      ? [...config.modules]
      : [
          {
            name: stateliRootModuleName,
            namespaced: false,
            state: config.initialState || {},
            actions: !!config.actions ? config.actions : [],
            getters: !!config.getters ? config.getters : [],
            mutations: !!config.mutations ? config.mutations : [],
          },
        ];
    const immutableModules = modules.map(x => new StateliModule<any>(x));
    this._modules = List(immutableModules);
  }

  getter(type: string) {
    for (const mod of this._modules) {
      for (const getter of mod.getters) {
        if (this.getType(mod, getter) === type) {
          return getter.getValue(mod.state, this.getter.bind(this), this.state);
        }
      }
    }
    return undefined;
  }

  commit<Payload = any>(type: string, payload: Payload) {
    for (const mod of this._modules) {
      let found = false;
      for (const mutation of mod.mutations) {
        if (this.getType(mod, mutation) === type) {
          found = true;
          const state = mutation.commit(mod.state, payload);
          mod.state = state;
          const store = new StateliSnapshotStore(this);
          this._subscribers.slice().forEach(sub => sub({ type, payload, state, store }));
          break;
        }
      }
      if (found) {
        break;
      }
    }
  }

  dispatch<Payload = any, Result = any>(type: string, payload: Payload) {
    for (const mod of this._modules) {
      for (const action of mod.actions) {
        if (this.getType(mod, action) === type) {
          return action.execute(this.getContext(mod), payload);
        }
      }
    }
    return Promise.resolve<Result>(null as any);
  }

  subscribe(observer: IFunctionObserver<IStateliObservable<RootState, any>>) {
    if (this._subscribers.indexOf(observer) < 0) {
      this._subscribers.push(observer);
    }
    return {
      unsubscribe: () => {
        const ix = this._subscribers.indexOf(observer);
        if (ix > -1) {
          this._subscribers.splice(ix, 1);
        }
      },
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
