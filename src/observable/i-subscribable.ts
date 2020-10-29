import { IFunctionObserver } from './i-observer';

export interface IUnsubscribable {
  unsubscribe(): void;
}

export type ISubscribable<T> = (observer: IFunctionObserver<T>, options?: { prepend: boolean }) => IUnsubscribable;
