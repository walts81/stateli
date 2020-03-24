import { IStateXContext } from './context';

export interface IStateXAction<State = any, Payload = any, Result = any> {
  type: string;
  execute: (context: IStateXContext<any, State>, payload?: Payload) => Promise<Result>;
}
