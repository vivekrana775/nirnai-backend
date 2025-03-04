export type DeleteArgs<TId = string> = {
  id: TId;
};

export type FindArgs<TId = string> = {
  id?: TId;
};

export interface FindByIdArgs {
  id: string;
}

export interface JsonObject {
  [key: string]: any;
}