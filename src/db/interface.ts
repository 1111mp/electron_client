export type BaseInterface = {
  close: () => Promise<void>;

  upsertUser: (data: UserType) => Promise<any>;
  getUserInfo: (data: UserType) => Promise<any>;
};

export type SqlInterface = BaseInterface & {
  initialize: () => Promise<boolean>;
};

export type ClientInterface = BaseInterface & {};

export type UserType = {
  userId: number;
  [key: string]: unknown;
};
