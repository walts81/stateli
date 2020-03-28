export interface HasType<T> {
  type: T;
}

export interface HasStringType extends HasType<string> {
}
