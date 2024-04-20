export type IUser = {
  id: number;
  name: string;
  images?: string[];
};

export type IImage = {
  id: number;
  url: string;
  user_id: number;
};
