import { IStateliContext } from './stateli-context';

export interface IStateliAction<State = any, Payload = any, Result = any> {
  type: string;
  execute: (context: IStateliContext<any, State>, payload?: Payload) => Promise<Result>;
}
