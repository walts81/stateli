import { Observable, Subscriber, Subscribable, Unsubscribable, PartialObserver } from 'rxjs';
import { IStateXAction } from './state-x-action';
import { IStateXContext } from './context';
import { IStateXGetter } from './state-x-getter';
import { IStateXModule } from './state-x-module';
import { IStateXMutation } from './state-x-mutation';
import { clone } from './clone';

export interface IStateXStore<RootState> extends Subscribable<{ type: string; store: IStateXStore<RootState> }> {
  readonly rootState: RootState;
  getter(type: string): any;
  commit<Payload = any>(type: string, payload?: Payload): void;
  dispatch<Payload = any, Result = any>(type: string, payload?: Payload): Promise<Result>;
}

class ReadonlyStateXStore<RootState> implements IStateXStore<RootState> {
  constructor(private rState: RootState, private store: IStateXStore<RootState>) {}

  get rootState() {
    return this.rState;
  }

  getter(type: string) {
    return this.store.getter(type);
  }

  commit<Payload = any>(type: string, payload?: Payload) {
    this.store.commit(type, payload);
  }

  dispatch<Payload = any, Result = any>(type: string, payload?: Payload) {
    return this.store.dispatch<Payload, Result>(type, payload);
  }

  subscribe(
    next?:
      | PartialObserver<{ type: string; store: IStateXStore<RootState> }>
      | null
      | undefined
      | ((value: { type: string; store: IStateXStore<RootState> }) => void),
    error?: null | undefined | ((error: any) => void),
    complete?: () => void
  ): Unsubscribable {
    return this.store.subscribe(next as any, error as any, complete);
  }
}

export class StateXStore<RootState> extends Observable<{ type: string; store: IStateXStore<RootState> }>
  implements IStateXStore<RootState> {
  private _modules: IStateXModule<RootState>[];
  private _subscriber: Subscriber<any>;

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

  get modules() {
    return [...this._modules];
  }

  constructor(config: {
    actions?: IStateXAction<RootState>[];
    mutations?: IStateXMutation<RootState>[];
    getters?: IStateXGetter<RootState>[];
    modules?: IStateXModule[];
    initialState?: RootState;
  }) {
    super(subscriber => {
      this._subscriber = subscriber;
    });
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

  getter(type: string): any {
    for (const m of this.modules) {
      for (const g of m.getters) {
        if (this.getType(m, g) === type) {
          return g.getValue(m.state, this.getter, this.rootState);
        }
      }
    }
    return null;
  }

  commit<Payload = any>(type: string, payload?: Payload) {
    for (const m of this.modules) {
      let found = false;
      for (const mutation of m.mutations) {
        if (this.getType(m, mutation) === type) {
          found = true;
          const state = mutation.commit(m.state, payload);
          (m as any).state = state;
          const clonedState = clone(this.rootState);
          setTimeout(
            () => this._subscriber.next({ type, store: new ReadonlyStateXStore<RootState>(clonedState, this) }),
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

  dispatch<Payload = any, Result = any>(type: string, payload?: Payload): Promise<Result> {
    for (const m of this.modules) {
      for (const action of m.actions) {
        if (this.getType(m, action) === type) {
          return action.execute(this.getContext(m), payload);
        }
      }
    }
    return Promise.resolve(null as any);
  }

  private getType<T extends { type: string }>(module: { name: string; namespaced: boolean }, item: T) {
    return module.namespaced ? `${module.name}/${item.type}` : item.type;
  }

  private getContext<State>(module: IStateXModule<State>) {
    const context: IStateXContext<RootState, State> = {
      rootState: this.rootState,
      state: module.state,
      commit: <Payload = any>(type: string, payload?: Payload) => this.commit<Payload>(type, payload),
      dispatch: <Payload = any, Result = any>(type: string, payload?: Payload) =>
        this.dispatch<Payload, Result>(type, payload),
    } as any;
    return context;
  }
}
