export type Category = {
  id: number;
  name: string;
};

export type PostForDetail = {
  id: number;
  title: string;
  content: string;
  coverImage: {
    url: string;
    width: number;
    height: number;
  };
  categories: Category[];
};
