import express from "express";
import ejs from "ejs";
import { promises as fs } from "fs";
import fetch from "node-fetch";

const app = express();

const mockGetUsername = () => {
  const randomId = Math.floor(Math.random() * 10) + 1;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        fetch("https://jsonplaceholder.typicode.com/users/" + randomId)
          .then((res) => res.json())
          .then((json) => json.username)
      );
    }, 1000);
  });
};

const __dirname = process.cwd();
app.use(express.static("static"));
app.set("views", "templates");
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  const isSwReq = req.headers["x-render-partial"];
  const username = await mockGetUsername(); // takes 1s to complete
  const contentPartial = ejs.renderFile(`${__dirname}/templates/index.ejs`, {
    username,
  });

  if (isSwReq) {
    res.send(await contentPartial);
    return;
  }

  const html = (
    await Promise.all([
      fs.readFile(`${__dirname}/static/partials/header-partial.html`),
      contentPartial,
      fs.readFile(`${__dirname}/static/partials/footer-partial.html`),
    ])
  ).join("");

  res.set("Content-Type", "text/html");
  res.send(html);
});

app.get("/sw.js", async (_, res) => {
  res.sendFile(`${__dirname}/sw.js`);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
