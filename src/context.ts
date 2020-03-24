export interface IStateXContext<RootState = any, State = any> {
  rootState: RootState;
  state: State;
  commit: (type: string, payload?: any) => void;
  dispatch: (type: string, payload?: any) => Promise<any>;
}
