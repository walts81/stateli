import { IFunctionObserver } from './i-observer';

export interface IUnsubscribable {
  unsubscribe(): void;
}

export interface ISubscribable<T> {
  subscribe(observer: IFunctionObserver<T>): IUnsubscribable;
}
