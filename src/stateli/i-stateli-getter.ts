import { HasStringType } from './../has-type';

export interface IStateliGetter<State, RooState = any, Result = any> extends HasStringType {
  getValue(state: State, rootGetters?: (type: string) => any, rootState?: RooState): Result;
}
