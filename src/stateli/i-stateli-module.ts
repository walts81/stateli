import { IStateliAction } from './i-stateli-action';
import { IStateliGetter } from './i-stateli-getter';
import { IStateliMutation } from './i-stateli-mutation';

export interface IStateliModule<State = any> {
  readonly name: string;
  readonly actions: IStateliAction<State>[];
  readonly getters: IStateliGetter<State>[];
  readonly mutations: IStateliMutation<State>[];
  readonly state: State;
  readonly namespaced: boolean;
}
