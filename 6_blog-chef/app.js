import express from "express";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import morgan from "morgan";
import { createWriteStream } from "fs";
import session from "express-session";

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const logFile = join(__dirname, "blogchef.log");

app.use("/assets", express.static(join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// app.use(morgan("dev"));
app.use(morgan(":method - :url - :date - :response-time ms"));
app.use(
  morgan(":method - :url - :date - :response-time ms", {
    stream: createWriteStream(logFile, { flags: "a" }),
  }),
);

app.use(
  "/admin",
  session({
    name: "sessId",
    resave: false,
    saveUninitialized: true,
    secret:
      app.get("env") === "production"
        ? process.env.sessionSecret
        : "1232131qdasdqqwe1121",
    cookie: {
      httpOnly: true,
      maxAge: 1800000,
      secure: app.get("env") === "production" ? true : false,
    },
  }),
); // without this default session name is connect.sid
app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.send("<h1>BlogChef</h1>");
});

app.get("/admin/dashboard", (req, res) => {
  res.render("dashboard", {
    user: req.session.user,
    posts: [
      {
        id: 1,
        author: "Joe Doe",
        title: "First Post",
        content: "This is the first post",
      },
      {
        id: 2,
        author: "Jane Smith",
        title: "Second Post",
        content: "This is the second post",
      },
      {
        id: 3,
        author: "Srey Pov",
        title: "Third Post",
        content: "This is the third post",
      },
    ],
  });
});

app.get("/admin/logout", (req, res) => {
  delete req.session.user;
  res.redirect("/admin/login");
});

app.get("/admin/approve", (req, res) => {
  res.rediret("/admin/dashboard");
});

app
  .get("/admin", (req, res) =>
    req.session.user
      ? res.redirect("/admin/dashboard")
      : res.redirect("/admin/login"),
  )
  .get("/admin/login", (req, res) => res.render("login"))
  .post("/admin/login", (req, res) => {
    const { email, password } = req.body;

    if (email === "homer@springfield.com" && password === "donuts") {
      req.session.user = "Homer Simpson";
      console.log("session information", req.session.user);
      return res.redirect("/admin/dashboard");
    }
    res.redirect("/admin/login");
  });

app.post("/admin/posts", (req, res) => {
  console.log(req.body);
  res.json({ message: "got it!" });
});

app.listen(3000, () => console.log("Blog Chef is cooking on port 3000"));
