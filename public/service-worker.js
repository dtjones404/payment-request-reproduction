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

self.addEventListener("message", async ({ data }) => {
  const { response } = await sendEventToMerchantPage({
    eventName: "message",
    eventPayload: data,
  });
  console.log(`service worker got response: ${response}`);
});

async function sendEventToMerchantPage({ eventName, eventPayload }) {
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

  return response?.modifiers?.[0]?.data;
}
