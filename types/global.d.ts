declare const IS_VUE2: boolean;

type DeepPartial<T> = T extends Function
  ? T
  : T extends object
    ? {
        [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;
