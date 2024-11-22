function launchPaymentRequest() {
  const paymentURL = window.location.origin + "/pay";
  const paymentRequest = new PaymentRequest(
    [
      {
        supportedMethods: paymentURL,
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

  paymentRequest.show();
}
