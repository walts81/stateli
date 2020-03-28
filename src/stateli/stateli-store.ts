import { Observable } from 'rxjs';
import { IStateliStore } from './i-stateli-store';
import { IStateliContext } from './i-stateli-context';
import { IStateliModule } from './i-stateli-module';
import { IStateliAction } from './i-stateli-action';
import { IStateliGetter } from './i-stateli-getter';
import { IStateliMutation } from './i-stateli-mutation';
import { IPartialObserver } from './../observable/i-observer';
import { IStateliObservable } from './i-stateli-observable';
import { IStateliSubscriber } from './i-stateli-subscriber';
import { ReadonlyStateliStore } from './readonly-stateli-store';
import { clone } from './../clone';
import { HasStringType } from './../has-type';

export class StateliStore<RootState> implements IStateliStore<RootState>, IStateliContext<RootState, RootState> {
  private _modules: IStateliModule<RootState>[];
  private _observable: Observable<IStateliObservable<RootState>>;
  private _subscriber: IStateliSubscriber<RootState>;

  get rootState() {
    if (this._modules.length === 1 && this._modules[0].name === 'root') {
      return clone(this._modules[0].state);
    }
    const s: any = {};
    for (const m of this.modules) {
      s[m.name] = m.state;
    }
    return s;
  }

  get state() {
    return this.rootState;
  }

  get modules() {
    return [...this._modules];
  }

  constructor(config: {
    actions?: IStateliAction<RootState>[];
    mutations?: IStateliMutation<RootState>[];
    getters?: IStateliGetter<RootState>[];
    modules?: IStateliModule[];
    initialState?: RootState;
  }) {
    this._observable = new Observable<IStateliObservable<RootState>>(subscriber => this._subscriber = subscriber);
    this._modules = !!config.modules ? [...config.modules] : [];
    if (this._modules.length === 0) {
      const localModule = {
        name: 'root',
        namespaced: false,
        state: config.initialState || ({} as any),
        actions: !!config.actions ? [...config.actions] : [],
        mutations: !!config.mutations ? [...config.mutations] : [],
        getters: !!config.getters ? [...config.getters] : [],
      };
      this._modules.unshift(localModule);
    }
  }

  getter(type: string) {
    for (const m of this.modules) {
      for (const g of m.getters) {
        if (this.getType(m, g) === type) {
          return g.getValue(m.state, this.getter, this.rootState);
        }
      }
    }
    return null;
  }

  commit<Payload = any>(type: string, payload: Payload) {
    for (const m of this.modules) {
      let found = false;
      for (const mutation of m.mutations) {
        if (this.getType(m, mutation) === type) {
          found = true;
          const state = mutation.commit(m.state, payload);
          (m as any).state = state;
          const clonedState = clone(this.rootState);
          setTimeout(
            () => this._subscriber.next({ type, store: new ReadonlyStateliStore<RootState>(clonedState, this) }),
            1
          );
          break;
        }
      }
      if (found) {
        break;
      }
    }
  }

  dispatch<Payload = any, Result = any>(type: string, payload: Payload) {
    for (const m of this.modules) {
      for (const action of m.actions) {
        if (this.getType(m, action) === type) {
          return action.execute(this.getContext(m), payload);
        }
      }
    }
    return Promise.resolve<Result>(null as any);
  }

  subscribe(observer?: IPartialObserver<IStateliObservable<RootState>>) {
    return this._observable.subscribe(observer);
  }

  private getType<T extends HasStringType>(module: { name: string; namespaced: boolean }, item: T) {
    return module.namespaced ? `${module.name}/${item.type}` : item.type;
  }

  private getContext<State>(module: IStateliModule<State>) {
    const context: IStateliContext<RootState, State> = {
      rootState: this.rootState,
      state: module.state,
      commit: <Payload = any>(type: string, payload: Payload) => this.commit<Payload>(type, payload),
      dispatch: <Payload = any, Result = any>(type: string, payload: Payload) =>
        this.dispatch<Payload, Result>(type, payload),
    } as any;
    return context;
  }
}
