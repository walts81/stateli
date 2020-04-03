import { ISubscribable } from './../observable/i-subscribable';
import { IStateliObservable } from './i-stateli-observable';

export interface IStateliStoreSubscribable<RootState, State>
  extends ISubscribable<IStateliObservable<RootState, State>> {}
