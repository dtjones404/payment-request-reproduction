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
    message: (eventPayload) => {
      console.log(`merchant page got message: ${eventPayload}`);
      return `merchant page acks message: ${eventPayload}`;
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
