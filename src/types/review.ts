export interface Review {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  comment: string;
  rating: number;
  updatedAt: string;
}
