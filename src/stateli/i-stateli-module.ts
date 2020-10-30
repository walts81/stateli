import { IStateliModuleBase } from './i-stateli-module-base';
import { IStateliAction } from './i-stateli-action';
import { IStateliGetter } from './i-stateli-getter';
import { IStateliMutation } from './i-stateli-mutation';

export interface IStateliModule<State = any> extends IStateliModuleBase<State> {
  addGetter(getter: IStateliGetter<State>);
  addAction(action: IStateliAction<State>);
  addMutation(mutation: IStateliMutation<State>);
}
