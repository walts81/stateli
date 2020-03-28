import { ISubscribable } from './../observable/i-subscribable';
import { IStateliObservable } from './i-stateli-observable';

export interface IStateliStoreSubscribable<RootState> extends ISubscribable<IStateliObservable<RootState>> {
}
