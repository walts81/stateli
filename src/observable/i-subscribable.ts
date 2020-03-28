import { IPartialObserver } from './i-observer';

export interface IUnsubscribable {
  unsubscribe(): void;
}

export interface ISubscribable<T> {
  subscribe(observer?: IPartialObserver<T>): IUnsubscribable;
}
