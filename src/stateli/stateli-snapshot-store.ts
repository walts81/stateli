import { IFunctionObserver } from './../observable/i-observer';
import { IStateliStore } from './i-stateli-store';
import { IStateliObservable } from './i-stateli-observable';
import { Map, fromJS } from 'immutable';

export class StateliSnapshotStore<RootState> implements IStateliStore<RootState> {
  private _rootState: Map<string, any>;

  constructor(rootState: RootState, private store: IStateliStore<RootState>) {
    this._rootState = fromJS(rootState);
  }

  get rootState() {
    return this._rootState.toJS() as RootState;
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

  subscribe(observer: IFunctionObserver<IStateliObservable<RootState>>) {
    return this.store.subscribe(observer);
  }
}
