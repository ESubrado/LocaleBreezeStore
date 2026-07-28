export type CartProduct = {
  id: number;
  name: string;
  priceAmount: number;
  currency: string;
  imageUrl: string;
  imageAlt: string;
  quantity: number | null;
  lowStockThreshold?: number | null;
};

export type CartItem = CartProduct & {
  cartQuantity: number;
};

export type CartTotal = {
  currency: string;
  amount: number;
};
