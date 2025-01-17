export type PaymentRequestShippingAddress = {
  addressLine?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

export type PaymentRequestShippingOption = string;

export type PayPalOnShippingAddressChangeData = {
  orderId?: string;
  shippingAddress: {
    city: string;
    countryCode: string;
    postalCode: string;
    state: string;
  };
};

export type PayPalOnShippingOptionsChangeData = {
  orderId: string;
  selectedShippingOption: {
    amount: {
      currencyCode: string;
      value: string;
    };
    id: string;
    label: string;
    selected: boolean;
    type: string;
  };
};
