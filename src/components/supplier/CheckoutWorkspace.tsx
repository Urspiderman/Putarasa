
"use client";

import CheckoutWorkspace from "@/components/buyer/CheckoutWorkspace";

type CheckoutItem = {
  cartItemId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl: string | null;
  isActive: boolean;
  stock: number;
};

type Props = {
  initialItems: CheckoutItem[];
  defaultName: string;
  defaultPhone: string;
  defaultAddress: string;
};

export default function SupplierCheckoutWorkspace(
  props: Props
) {
  return (
    <CheckoutWorkspace
      {...props}
      role="supplier"
    />
  );
}
