import { ISubscribable } from './../observable/i-subscribable';
import { IStateliObservable } from './i-stateli-observable';

export interface IStateliStoreSubscribable<RootState> {
  subscribeToMutation: ISubscribable<IStateliObservable<RootState>>;
  subscribeToAction: ISubscribable<IStateliObservable<RootState>>;
}
