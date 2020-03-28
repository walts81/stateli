import { IStateliStoreSubscribable } from './i-stateli-store-subscribable';

export interface IStateliStore<RootState> extends IStateliStoreSubscribable<RootState> {
  readonly rootState: RootState;
  getter(type: string): any;
  commit<Payload = any>(type: string, payload: Payload): void;
  dispatch<Payload = any, Result = any>(type: string, payload: Payload): Promise<Result>;
}
