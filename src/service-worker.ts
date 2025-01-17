// @ts-expect-error asdf
type PaymentRequestShippingAddress = {
  addressLine?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

// @ts-expect-error asdf
type PaymentRequestShippingOption = string;

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

interface Window extends ServiceWorkerGlobalScope {}

self.addEventListener("install", function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("canmakepayment", function (event) {
  event.respondWith(
    new Promise(function (resolve) {
      resolve(true);
    })
  );
});

let activePaymentRequestEvent;
self.addEventListener("paymentrequest", async (paymentRequestEvent) => {
  activePaymentRequestEvent = paymentRequestEvent;

  let resolve;
  let reject;
  const promise = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  paymentRequestEvent.respondWith(promise);
  paymentRequestEvent.openWindow("/checkout.html");
});

self.addEventListener(
  "message",
  async ({ data: { eventName, eventPayload } }) => {
    handleEventFromPaymentApp(eventName, eventPayload);
  }
);

async function handleEventFromPaymentApp(
  eventName: string,
  eventPayload: unknown
) {
  switch (eventName) {
    case "shippingaddresschange":
      try {
        const shippingAddressResponse =
          await sendShippingAddressChangeToMerchantPage(
            eventPayload as PayPalOnShippingAddressChangeData
          );
        console.log(
          "service worker got response for shippingaddresschange event:",
          shippingAddressResponse
        );
      } catch (err) {
        console.log(
          `service worker got shippingaddresschange rejection: ${err}`
        );
      }

      break;

    case "shippingoptionschange":
      try {
        const shippingOptionsResponse =
          await sendShippingOptionsChangeToMerchantPage(
            eventPayload as PayPalOnShippingOptionsChangeData
          );
        console.log(
          "service worker got response for shippingoptionchange event:",
          shippingOptionsResponse
        );
      } catch (err) {
        console.log(
          `service worker got shippingoptionchange rejection: ${err}`
        );
      }

      break;
    default:
      break;
  }
}

async function sendShippingAddressChangeToMerchantPage({
  shippingAddress: { city, countryCode, postalCode, state },
}: PayPalOnShippingAddressChangeData) {
  if (!activePaymentRequestEvent) {
    return;
  }

  const paymentRequestShippingAddress: PaymentRequestShippingAddress = {
    city,
    country: countryCode,
    postalCode,
    region: state,
    // @ts-expect-error asdf
    shippingOption: "hack",
    selectedShippingOption: "hack",
  };

  return await activePaymentRequestEvent.changeShippingAddress(
    paymentRequestShippingAddress
  );
}

async function sendShippingOptionsChangeToMerchantPage({
  selectedShippingOption: { amount, id, label, selected, type },
}: PayPalOnShippingOptionsChangeData) {
  if (!activePaymentRequestEvent) {
    return;
  }

  const paymentRequestShippingOption: string = JSON.stringify({
    id,
    amount,
    label,
    selected,
    type,
  });

  return await activePaymentRequestEvent.changeShippingOption("hack", {
    asdf: "1234",
  });
}
