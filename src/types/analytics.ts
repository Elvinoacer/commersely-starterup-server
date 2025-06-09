export interface AnalyticsResponse {
  users: {
    total: number;
    newUsers: number;
    byRole: { role: string; count: number }[];
  };
  // @ts-ignore
  orders: {
    total: number;
    revenue: number;
    averageOrderValue: number;
    byStatus: { status: string; count: number }[];
    byPaymentMethod: { method: string; count: number }[];
  };
  products: {
    total: number;
    lowStock: number;
    topSelling: { id: string; name: string; soldCount: number }[];
  };
  categories: {
    total: number;
    byCategory: { id: string; name: string; productCount: number }[];
  };
  reviews: {
    averageRating: number;
    totalReviews: number;
  };
}
