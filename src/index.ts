// @ts-expect-error asdf
type PaymentRequestShippingAddress = {
  addressLine?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

// @ts-expect-error asdf
type PaymentRequestShippingOption = {
  id: string;
  data?: Record<string, any>;
};

// @ts-expect-error asdf
type PayPalOnShippingAddressChangeData = {
  orderId?: string;
  shippingAddress: {
    city: string;
    countryCode: string;
    postalCode: string;
    state: string;
  };
};

// @ts-expect-error asdf
type PayPalOnShippingOptionsChangeData = {
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

async function onShippingAddressChange(
  data: PayPalOnShippingAddressChangeData
) {
  // merchant can make a fetch call to their server
  // to approve the address and update the order amount
  // return await fetch("/merchant-server/update-shipping-and-tax-amounts", {
  //   method: "POST",
  //   body: JSON.stringify(data),
  // });
  console.log("got shippingaddresschange event from the payment app:", data);

  await new Promise((resolve) => setTimeout(resolve, 3000));

  // throw new Error("merchant doesn't shipp to this address!");

  return { approved: "true" };
}

async function onShippingOptionsChange(
  data: PayPalOnShippingOptionsChangeData
) {
  console.log("got shippingoptionschange event from the payment app:", data);

  await new Promise((resolve) => setTimeout(resolve, 3000));

  // throw new Error("free shipping not available!");

  return { approved: "true" };
}

async function launchPaymentRequest() {
  async function setupPaymentAppMessaging(paymentRequest) {
    paymentRequest.addEventListener("shippingaddresschange", (event, extra) => {
      console.log(event, extra);
      const paymentRequestAddress: PaymentRequestShippingAddress =
        event.target.shippingAddress;

      const paypalShippingAddress: PayPalOnShippingAddressChangeData = {
        shippingAddress: {
          city: paymentRequestAddress.city,
          countryCode: paymentRequestAddress.country,
          postalCode: paymentRequestAddress.postalCode,
          state: paymentRequestAddress.region,
        },
      };

      async function getResponsePromise() {
        return onShippingAddressChange?.(paypalShippingAddress).catch((err) => {
          console.log("hit response promise catch: ", err);
          return {
            error: err,
          };
        });
      }

      try {
        event.updateWith(getResponsePromise());
      } catch (err) {
        console.log("hit updateWith catch", err);
      }
    });

    paymentRequest.addEventListener("shippingoptionchange", async (event) => {
      const paymentRequestShippingOption: PaymentRequestShippingOption =
        event.target.shippingAddress;

      console.log(event, paymentRequest);
      // const paypalShippingOption: PayPalOnShippingOptionsChangeData = {
      //   selectedShippingOption: {},
      // };

      async function getResponsePromise() {
        // return onShippingOptionsChange?.(paypalShippingAddress).catch((err) => {
        //   console.log("hit response promise catch: ", err);
        //   return {
        //     error: err,
        //   };
        // });
      }

      try {
        await event.updateWith(getResponsePromise());
        console.log(paymentRequest);
      } catch (err) {
        console.log("hit updateWith catch", err);
      }
    });
  }

  const paymentURL = window.location.origin + "/pay";
  const paymentRequest = new PaymentRequest(
    [
      {
        supportedMethods: paymentURL,
        data: {},
      },
    ],
    {
      total: {
        amount: {
          currency: "USD",
          value: "0.00",
        },
        label: "x",
      },
      shippingOptions: [
        { id: "hack", label: "x", amount: { currency: "USD", value: "0.00" } },
      ],
    },
    { requestShipping: true }
  );

  setupPaymentAppMessaging(paymentRequest);

  const paymentResponse = await paymentRequest.show({
    modifiers: [
      {
        supportedMethods: paymentURL,
        total: {
          amount: { currency: "USD", value: "0" },
          /* TODO: remove this once the PaymentRequest API is fixed.
              Passing the URL in the data object is broken currently,
              passing it as a label is the only workable solution */
          label: "x",
        },
      },
    ],
  });
  paymentResponse.complete();
}
