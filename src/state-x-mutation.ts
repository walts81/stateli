export interface IStateXMutation<State = any, Payload = any> {
  type: string;
  commit: (state: State, payload?: Payload) => State;
}
