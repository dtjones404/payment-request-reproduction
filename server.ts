import Express from "express";

async function sleep(ms) {
  await new Promise((resolve, reject) => setTimeout(resolve, ms));
}

const app = Express();

app.use("/", Express.static("public"));

app.get("/pay", (req, res) => {
  res
    .header("Link", '</payment-manifest.json>; rel="payment-method-manifest"')
    .send();
});

app.get("/checkout", async (req, res) => {
  await sleep(3000);
  res.send("Welcome to TestPay!");
});

app.listen(3434, console.log("app listening at http://localhost:3434/"));
