import { Subject } from 'rxjs';
import { List } from 'immutable';
import { IStateliStore } from './i-stateli-store';
import { IStateliContext } from './i-stateli-context';
import { IStateliModule } from './i-stateli-module';
import { IStateliAction } from './i-stateli-action';
import { IStateliGetter } from './i-stateli-getter';
import { IStateliMutation } from './i-stateli-mutation';
import { IFunctionObserver } from './../observable/i-observer';
import { IStateliObservable } from './i-stateli-observable';
import { StateliSnapshotStore } from './stateli-snapshot-store';
import { StateliModule } from './stateli-module';
import { HasStringType } from './../has-type';

const stateliRootModuleName = 'stateli_root';

export class StateliStore<RootState> implements IStateliStore<RootState>, IStateliContext<RootState, RootState> {
  private _modules: List<IStateliModule>;
  private _observable = new Subject<IStateliObservable<RootState>>();

  get rootState() {
    const count = this._modules.count();
    const firstMod = count === 1 ? this._modules.get(0) : null;
    const modName = count === 1 ? firstMod?.name : '';
    if (modName === stateliRootModuleName) {
      return firstMod?.state as RootState;
    }
    const s: any = {};
    for (const m of this._modules) {
      s[m.name] = m.state;
    }
    return s as RootState;
  }

  get state() {
    return this.rootState;
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
    const modules = !!config.modules ? [...config.modules] : [{
      name: stateliRootModuleName,
      namespaced: false,
      state: config.initialState || {},
      actions: !!config.actions ? config.actions : [],
      getters: !!config.getters ? config.getters : [],
      mutations: !!config.mutations ? config.mutations : [],
    }];
    const immutableModules = modules.map(x => new StateliModule<any>(x));
    this._modules = List(immutableModules);
  }

  getter(type: string) {
    for (const mod of this._modules) {
      for (const getter of mod.getters) {
        if (this.getType(mod, getter) === type) {
          return getter.getValue(mod.state, this.getter.bind(this), this.rootState);
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
          mod.state = mutation.commit(mod.state, payload);
          const rState = this.rootState;
          const store = new StateliSnapshotStore(rState, this);
          this._observable.next({ type, payload, store });
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

  subscribe(observer: IFunctionObserver<IStateliObservable<RootState>>) {
    return this._observable.subscribe(observer);
  }

  private getType<T extends HasStringType>(mod: { name: string; namespaced: boolean }, item: T) {
    return mod.namespaced ? `${mod.name}/${item.type}` : item.type;
  }

  private getContext<State>(mod: IStateliModule<State>) {
    const context: IStateliContext<RootState, State> = {
      rootState: this.rootState,
      state: mod.state,
      commit: <Payload = any>(type: string, payload: Payload) => this.commit<Payload>(type, payload),
      dispatch: <Payload = any, Result = any>(type: string, payload: Payload) =>
        this.dispatch<Payload, Result>(type, payload),
    } as any;
    return context;
  }
}
