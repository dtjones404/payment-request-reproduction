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

self.addEventListener("paymentrequest", async (paymentRequestEvent) => {
  let resolve;
  let reject;
  const promise = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  paymentRequestEvent.respondWith(promise);
  paymentRequestEvent.openWindow("/checkout");
});
