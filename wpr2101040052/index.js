const express = require("express");
const cookieParser = require("cookie-parser");
const authenticate = require("./server/middleware/authWithCookies");
const {
  fetchEmailsInBox,
  fetchEmailsOutBox,
  fetchUsers,
  fetchMailByID,
  fetchUserByEmail,
} = require("./dbsetup");

const path = require("path");
const app = express();

const _dirname = path.resolve();

// middle ware service
app.use(express.static(path.join(_dirname, "public")));
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(express.json({ limit: "10mb" }));
app.set("view engine", "ejs");
app.set("views", path.join(_dirname, "views"));

//controllers for API
const apiController = require("./server/apiController");
app.use("/api/v1", apiController);

// pages
app.get("/", (req, res) => {
  res.render("signInPage");
});
app.get("/signup", (req, res) => {
  res.render("signUpPage");
});
app.get("/inbox", authenticate, async (req, res) => {
  const email = req.cookies.email;
  const usersEmails = await fetchUsers();
  const page = parseInt(req.query.page) || 1;
  const pageSize = 5;
  const data = await fetchEmailsInBox(email, page, pageSize);
  res.render("mainPage", {
    iblock: "block",
    oblock: "none",
    dblock: "none",
    users: usersEmails,
    fullname: data.fullname,
    data: data.emails,
    totalPages: data.totalPages,
    currentPage: page,
    mail: {},
  });
});
app.get("/outbox", authenticate, async (req, res) => {
  const email = req.cookies.email;
  const usersEmails = await fetchUsers();
  const page = parseInt(req.query.page) || 1;
  const pageSize = 5;
  const data = await fetchEmailsOutBox(email, page, pageSize);
  res.render("mainPage", {
    iblock: "none",
    oblock: "block",
    dblock: "none",
    users: usersEmails,
    fullname: data.fullname,
    data: data.emails,
    totalPages: data.totalPages,
    currentPage: page,
    mail: {},
  });
});
app.get("/mail/:mailID", authenticate, async (req, res) => {
  const mail = await fetchMailByID(req.params.mailID);
  const user = await fetchUserByEmail(req.cookies.email);
  res.render("mainPage", {
    iblock: "none",
    oblock: "none",
    dblock: "block",
    users: {},
    fullname: user.fullname,
    data: {},
    totalPages: "",
    currentPage: "",
    mail: mail,
  });
});

app.get("/signout", (req, res) => {
  res.clearCookie("email");
  res.redirect("/");
});
const port = 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
