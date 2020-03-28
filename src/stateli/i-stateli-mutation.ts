import { HasStringType } from './../has-type';

export interface IStateliMutation<State = any, Payload = any> extends HasStringType {
  commit: (state: State, payload: Payload) => State;
}
