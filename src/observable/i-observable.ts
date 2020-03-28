import { IUnsubscribable } from './i-subscribable';
import { IPartialObserver } from './i-observer';

export interface IObservable<T> {
  subscribe(observer?: IPartialObserver<T>): IUnsubscribable;
}
