import { IPartialObserver } from './../observable/i-observer';
import { IStateliStore } from './i-stateli-store';
import { IStateliObservable } from './i-stateli-observable';

export class ReadonlyStateliStore<RootState> implements IStateliStore<RootState> {
  constructor(private rState: RootState, private store: IStateliStore<RootState>) { }

  get rootState() {
    return this.rState;
  }

  getter(type: string) {
    return this.store.getter(type);
  }

  commit<Payload = any>(type: string, payload: Payload) {
    this.store.commit(type, payload);
  }

  dispatch<Payload = any, Result = any>(type: string, payload: Payload) {
    return this.store.dispatch<Payload, Result>(type, payload);
  }

  subscribe(observer?: IPartialObserver<IStateliObservable<RootState>>) {
    return this.store.subscribe(observer);
  }
}