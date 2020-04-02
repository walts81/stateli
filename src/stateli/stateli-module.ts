import { IStateliModule } from './i-stateli-module';
import { IStateliAction } from './i-stateli-action';
import { IStateliGetter } from './i-stateli-getter';
import { IStateliMutation } from './i-stateli-mutation';
import { HasStringType } from './../has-type';
import { Map, List, fromJS } from 'immutable';

export class StateliModule<State> implements IStateliModule<State> {
  private _actions: List<IStateliAction<State>> = List([]);
  private _mutations: List<IStateliMutation<State>> = List([]);
  private _getters: List<IStateliGetter<State>> = List([]);
  private _state: Map<string, any>;
  private _m = Map({ name: '', namespaced: false });

  constructor(mod: IStateliModule<State>);
  constructor(name: string, namespaced: boolean, state: State);
  constructor(...args: any[]) {
    if (args.length === 1 && !!args[0].state) {
      this._m = this._m.set('name', args[0].name);
      this._m = this._m.set('namespaced', args[0].namespaced === true);
      this._state = fromJS(args[0].state);
      const a = args[0].actions || [];
      a.forEach(x => this.addAction(x));
      const g = args[0].getters || [];
      g.forEach(x => this.addGetter(x));
      const m = args[0].mutations || [];
      m.forEach(x => this.addMutation(x));
    } else if (args.length === 3) {
      this._m = this._m.set('name', args[0]);
      this._m = this._m.set('namespaced', args[1] === true);
      this._state = fromJS(args[2]);
    } else {
      throw new Error('Invalid constructor arguments');
    }
  }

  get name() {
    return this._m.get('name') as string;
  }

  get namespaced() {
    return this._m.get('namespaced') as boolean;
  }

  get state() {
    return this._state.toJS() as State;
  }
  set state(s: State) {
    this._state = fromJS(s);
  }

  get actions() {
    return this._actions.toJS();
  }

  get mutations() {
    return this._mutations.toJS();
  }

  get getters() {
    return this._getters.toJS();
  }

  addGetter(getter: IStateliGetter<State>) {
    this._getters = this.addItem('GETTER', getter, this._getters);
  }

  addAction(action: IStateliAction<State>) {
    this._actions = this.addItem('ACTION', action, this._actions);
  }

  addMutation(mutation: IStateliMutation<State>) {
    this._mutations = this.addItem('MUTATION', mutation, this._mutations);
  }

  private addItem<T extends HasStringType>(type: string, item: T, arr: List<T>) {
    this.checkType(type, item.type);
    return arr.push(item);
  }

  private checkType(type: string, typeToCheck: string) {
    if (!typeToCheck) {
      throw new Error(`${type} must have a type defined`);
    }
    if (typeToCheck.indexOf('/') > -1) {
      throw new Error(`${type} type cannot contain a forward slash "/"`);
    }
  }
}
