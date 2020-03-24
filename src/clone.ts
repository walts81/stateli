export const clone = <T>(val: T): T => {
  const c = JSON.parse(JSON.stringify(val));
  return c;
};
