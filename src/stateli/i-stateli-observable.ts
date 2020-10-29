import { HasStringType } from './../has-type';
import { IStateliSnapshotStore } from './i-stateli-snapshot-store';

export interface IStateliObservable<RootState> extends HasStringType {
  payload: any;
  state: RootState;
  store: IStateliSnapshotStore<RootState>;
}
