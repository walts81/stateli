import { HasStringType } from './../has-type';
import { IStateliStore } from './i-stateli-store';

export interface IStateliObservable<RootState> extends HasStringType {
  payload: any;
  store: IStateliStore<RootState>;
}
