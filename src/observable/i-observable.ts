import { IUnsubscribable } from './i-subscribable';
import { IFunctionObserver } from './i-observer';

export interface IObservable<T> {
  subscribe(observer: IFunctionObserver<T>): IUnsubscribable;
}
