import { IStateliAction } from './stateli-action';
import { IStateliGetter } from './stateli-getter';
import { IStateliMutation } from './stateli-mutation';

export interface IStateliModule<State = any> {
  readonly name: string;
  readonly actions: IStateliAction<State>[];
  readonly getters: IStateliGetter<State>[];
  readonly mutations: IStateliMutation<State>[];
  readonly state: State;
  readonly namespaced: boolean;
}

export class StateliModule<State> implements IStateliModule<State> {
  private _actions: IStateliAction<State>[] = [];
  private _mutations: IStateliMutation<State>[] = [];
  private _getters: IStateliGetter<State>[] = [];
  private _state: State;
  private _name: string;
  private _namespaced: boolean;

  constructor(name: string, namespaced: boolean, state: State) {
    this._name = name;
    this._namespaced = namespaced;
    this._state = state;
  }

  get name() {
    return this._name;
  }

  get namespaced() {
    return this._namespaced;
  }

  get state() {
    return { ...this._state };
  }
  set state(s: State) {
    this._state = s;
  }

  get actions() {
    return [...this._actions];
  }

  get mutations() {
    return [...this._mutations];
  }

  get getters() {
    return [...this._getters];
  }

  protected addGetter(getter: IStateliGetter<State>) {
    this.addItem('GETTER', getter, this._getters);
  }

  protected addAction(action: IStateliAction<State>) {
    this.addItem('ACTION', action, this._actions);
  }

  protected addMutation(mutation: IStateliMutation<State>) {
    this.addItem('MUTATION', mutation, this._mutations);
  }

  private addItem<T extends { type: string }>(type: string, item: T, arr: T[]) {
    this.checkType(type, item.type);
    // item.type = this.getNamespacedType(item.type);
    arr.push(item);
  }

  private checkType(type: string, typeToCheck: string) {
    if (!typeToCheck) {
      throw new Error(`${type} must have a type defined`);
    }
    if (typeToCheck.indexOf('/') > -1) {
      throw new Error(`${type} type cannot contain a forward slash "/"`);
    }
  }

  // private getNamespacedType(type: string) {
  //   return this.namespaced ? `${this.name}/${type}` : type;
  // }
}
