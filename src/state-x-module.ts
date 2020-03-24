import { IStateXAction } from './state-x-action';
import { IStateXGetter } from './state-x-getter';
import { IStateXMutation } from './state-x-mutation';

export interface IStateXModule<State = any> {
  readonly name: string;
  readonly actions: IStateXAction<State>[];
  readonly getters: IStateXGetter<State>[];
  readonly mutations: IStateXMutation<State>[];
  readonly state: State;
  readonly namespaced: boolean;
}

export class StateXModule<State> implements IStateXModule<State> {
  private _actions: IStateXAction<State>[] = [];
  private _mutations: IStateXMutation<State>[] = [];
  private _getters: IStateXGetter<State>[] = [];
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

  protected addGetter(getter: IStateXGetter<State>) {
    this.addItem('GETTER', getter, this._getters);
  }

  protected addAction(action: IStateXAction<State>) {
    this.addItem('ACTION', action, this._actions);
  }

  protected addMutation(mutation: IStateXMutation<State>) {
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
