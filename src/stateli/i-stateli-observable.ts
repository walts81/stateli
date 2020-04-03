import { HasStringType } from './../has-type';
import { IStateliSnapshotStore } from './i-stateli-snapshot-store';

export interface IStateliObservable<RootState, State> extends HasStringType {
  payload: any;
  state: State;
  store: IStateliSnapshotStore<RootState>;
}
