import { Map, fromJS } from 'immutable';
import { IStateliSnapshotStore } from './i-stateli-snapshot-store';
import { IStateliStore } from './i-stateli-store';
import { IStateliAction } from './i-stateli-action';
import { IStateliMutation } from './i-stateli-mutation';
import { IStateliGetter } from './i-stateli-getter';
import { IStateliModule } from './i-stateli-module';

export class StateliSnapshotStore<RootState> implements IStateliSnapshotStore<RootState> {
  private _rootSnapshot: Map<string, any>;

  constructor(private store: IStateliStore<RootState>) {
    this._rootSnapshot = fromJS(store.state);
  }

  get state() {
    return this.store.state;
  }
  set state(s: RootState) {
    this.store.state = s;
  }

  get snapshot() {
    return this._rootSnapshot.toJS() as RootState;
  }

  asContext() {
    return this.store.asContext();
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

  reset(config: {
    actions?: IStateliAction<RootState>[];
    mutations?: IStateliMutation<RootState>[];
    getters?: IStateliGetter<RootState>[];
    modules?: IStateliModule[];
    initialState?: RootState;
  }) {
    this.store.reset(config);
  }
}
