import { readFileSync } from "node:fs";
import Express from "express";

const app = Express();

app.use("/", Express.static("public"));

app.get("/index.js", (req, res) => {
  const fileContents = readFileSync("./dist/index.js");
  res.header("Content-Type", "application/javascript").send(fileContents);
});

app.get("/service-worker.js", (req, res) => {
  const fileContents = readFileSync("./dist/service-worker.js");
  res.header("Content-Type", "application/javascript").send(fileContents);
});

app.get("/pay", (req, res) => {
  res
    .header("Link", '</payment-manifest.json>; rel="payment-method-manifest"')
    .send();
});

app.listen(3434, () => console.log("app listening at http://localhost:3434/"));
