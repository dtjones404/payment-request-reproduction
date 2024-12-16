import Express from "express";

const app = Express();

app.use("/", Express.static("public"));

app.get("/pay", (req, res) => {
  res
    .header("Link", '</payment-manifest.json>; rel="payment-method-manifest"')
    .send();
});

app.listen(3434, console.log("app listening at http://localhost:3434/"));
