type OnShippingAddressChangeData = {
  orderId: string;
  partialShippingAddress: {
    // we only provide a partial address for shipping calculations
    // to avoid sending PII data
    city: string;
    countryCode: string;
    postalCode: string;
    state: string;
  };
};

async function onShippingAddressChange(data: OnShippingAddressChangeData) {
  // merchant can make a fetch call to their server
  // to approve the address and update the order amount
  // return await fetch("/merchant-server/update-shipping-and-tax-amounts", {
  //   method: "POST",
  //   body: JSON.stringify(data),
  // });
  console.log("got shippingaddresschange event from the payment app:", data);
  return { approved: "true" };
}

async function launchPaymentRequest() {
  async function setupPaymentAppMessaging(paymentRequest, eventHandlers) {
    paymentRequest.onpaymentmethodchange = (event) => {
      const details = event.methodDetails;
      const { eventName, eventPayload } = details;

      const eventHandler = eventHandlers[eventName];

      async function getResponsePromise() {
        const response = await eventHandler?.(eventPayload);
        return {
          modifiers: [
            {
              data: { response },
              supportedMethods: paymentURL,
            },
          ],
        };
      }

      event.updateWith(getResponsePromise());
    };
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
    }
  );

  const eventHandlers = {
    shippingaddresschange: async (
      eventPayload: OnShippingAddressChangeData
    ) => {
      return await onShippingAddressChange(eventPayload);
    },
  };
  setupPaymentAppMessaging(paymentRequest, eventHandlers);

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
