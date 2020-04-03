import { IStateliStoreSubscribable } from './i-stateli-store-subscribable';
import { IStateliStoreBase } from './i-stateli-store-base';

export interface IStateliStore<RootState>
  extends IStateliStoreBase<RootState>,
    IStateliStoreSubscribable<RootState, any> {}
