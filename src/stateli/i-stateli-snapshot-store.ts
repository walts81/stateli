import { IStateliStoreBase } from './i-stateli-store-base';

export interface IStateliSnapshotStore<RootState> extends IStateliStoreBase<RootState> {
  snapshot: RootState;
}
