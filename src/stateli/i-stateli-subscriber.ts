import { IStateliObservable } from './i-stateli-observable';

export interface IStateliSubscriber<RootState> {
  next: (observable?: IStateliObservable<RootState>) => void;
}
