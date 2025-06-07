export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  count: number;
  children?: Category[];
}
