function authenticate(req, res, next) {
  if (req.cookies.email) {
    next();
  } else {
    res.status(403).json({ success: false, message: "Unauthorized. You need to sign in first." });
  }
}

module.exports = authenticate;
