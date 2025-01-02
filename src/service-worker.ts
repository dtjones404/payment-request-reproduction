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
      const shippingAddressResponse = await sendEventToMerchantPage(
        eventName,
        eventPayload
      );
      console.log(
        "service worker got response for shippingaddresschange event:",
        shippingAddressResponse
      );
      break;
    default:
      break;
  }
}

async function sendEventToMerchantPage(
  eventName: string,
  eventPayload: unknown
) {
  if (!activePaymentRequestEvent) {
    return;
  }

  const response = await activePaymentRequestEvent.changePaymentMethod(
    activePaymentRequestEvent.methodData[0].supportedMethods,
    {
      eventName,
      eventPayload,
    }
  );

  return response?.modifiers?.[0]?.data.response;
}
