import { IStateliContext } from './i-stateli-context';
import { HasStringType } from './../has-type';

export interface IStateliAction<State = any, Payload = any, Result = any> extends HasStringType {
  execute: (context: IStateliContext<any, State>, payload: Payload) => Promise<Result>;
}
