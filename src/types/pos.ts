export type Category = "Milk tea" | "Fruit tea" | "Water";
export type Product = {
  id: string;
  name: string;
  shortName: string;
  price: number;
  category: Category;
  description: string;
  imageIndex: number;
};
export type CartItem = { productId: string; quantity: number };
export type ReceiptItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
};
export type CompletedTransaction = {
  reference: string;
  timestamp: string;
  items: ReceiptItem[];
  total: number;
  paid: number;
  change: number;
};
export type SaleState = {
  stage: "order" | "review" | "complete";
  cart: CartItem[];
  payment: string;
  error: string;
  completed: CompletedTransaction | null;
  sequence: number;
};
