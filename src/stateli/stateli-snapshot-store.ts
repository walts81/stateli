import { Map, fromJS } from 'immutable';
import { IStateliSnapshotStore } from './i-stateli-snapshot-store';
import { IStateliStore } from './i-stateli-store';

export class StateliSnapshotStore<RootState> implements IStateliSnapshotStore<RootState> {
  private _rootSnapshot: Map<string, any>;

  constructor(private store: IStateliStore<RootState>) {
    this._rootSnapshot = fromJS(store.state);
  }

  get state() {
    return this.store.state;
  }

  get snapshot() {
    return this._rootSnapshot.toJS() as RootState;
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
}
