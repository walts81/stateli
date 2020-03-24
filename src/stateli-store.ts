import { Observable, Subscriber, Subscribable, Unsubscribable, PartialObserver } from 'rxjs';
import { IStateliAction } from './stateli-action';
import { IStateliContext } from './stateli-context';
import { IStateliGetter } from './stateli-getter';
import { IStateliModule } from './stateli-module';
import { IStateliMutation } from './stateli-mutation';
import { clone } from './clone';

export interface IStateliStore<RootState> extends Subscribable<{ type: string; store: IStateliStore<RootState> }> {
  readonly rootState: RootState;
  getter(type: string): any;
  commit<Payload = any>(type: string, payload?: Payload): void;
  dispatch<Payload = any, Result = any>(type: string, payload?: Payload): Promise<Result>;
}

class ReadonlyStateliStore<RootState> implements IStateliStore<RootState> {
  constructor(private rState: RootState, private store: IStateliStore<RootState>) {}

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
      | PartialObserver<{ type: string; store: IStateliStore<RootState> }>
      | null
      | undefined
      | ((value: { type: string; store: IStateliStore<RootState> }) => void),
    error?: null | undefined | ((error: any) => void),
    complete?: () => void
  ): Unsubscribable {
    return this.store.subscribe(next as any, error as any, complete);
  }
}

export class StateliStore<RootState> extends Observable<{ type: string; store: IStateliStore<RootState> }>
  implements IStateliStore<RootState> {
  private _modules: IStateliModule<RootState>[];
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
    actions?: IStateliAction<RootState>[];
    mutations?: IStateliMutation<RootState>[];
    getters?: IStateliGetter<RootState>[];
    modules?: IStateliModule[];
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

  private getContext<State>(module: IStateliModule<State>) {
    const context: IStateliContext<RootState, State> = {
      rootState: this.rootState,
      state: module.state,
      commit: <Payload = any>(type: string, payload?: Payload) => this.commit<Payload>(type, payload),
      dispatch: <Payload = any, Result = any>(type: string, payload?: Payload) =>
        this.dispatch<Payload, Result>(type, payload),
    } as any;
    return context;
  }
}
