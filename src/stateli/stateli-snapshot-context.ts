import { IStateliContext } from './i-stateli-context';
import { IStateliStore } from './i-stateli-store';
import { Map, fromJS } from 'immutable';

export class StateliSnapshotContext<RootState, State> implements IStateliContext<RootState, State> {
  private _rootStateSnapshot: Map<string, any>;
  private _stateSnapshot: Map<string, any>;

  constructor(private getState: (store: IStateliStore<RootState>) => State, private store: IStateliStore<RootState>) {
    this._rootStateSnapshot = fromJS(store.state);
    this._stateSnapshot = fromJS(getState(store));
  }

  get rootState() {
    return this.store.state;
  }

  get state() {
    return this.getState(this.store);
  }

  get snapshots() {
    return {
      rootState: this._rootStateSnapshot.toJS() as RootState,
      state: this._stateSnapshot.toJS() as State,
    };
  }

  commit<Payload = any>(type: string, payload: Payload) {
    this.store.commit<Payload>(type, payload);
  }

  dispatch<Payload = any, Result = any>(type: string, payload: Payload) {
    return this.store.dispatch<Payload, Result>(type, payload);
  }
}
