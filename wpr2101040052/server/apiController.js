const express = require("express");
const path = require("path");
const multer = require("multer");
const { signIn, signUp, sendMail } = require("./apiServices.js");
const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post("/signUp", signUp);
router.post("/signIn", signIn);
router.post("/send", upload.single("attachment"), sendMail);

module.exports = router;
