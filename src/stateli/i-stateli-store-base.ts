export interface IStateliStoreBase<RootState> {
  readonly state: RootState;
  getter(type: string): any;
  commit<Payload = any>(type: string, payload: Payload): void;
  dispatch<Payload = any, Result = any>(type: string, payload: Payload): Promise<Result>;
}
