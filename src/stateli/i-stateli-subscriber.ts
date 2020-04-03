import { IStateliObservable } from './i-stateli-observable';

export interface IStateliSubscriber<RootState, State> {
  next: (observable?: IStateliObservable<RootState, State>) => void;
}
