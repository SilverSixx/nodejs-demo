const {
  fetchUserByEmail,
  insertNewUser,
  insertNewMail,
  insertMailTrack,
  fetchMailID,
} = require("../dbsetup");

async function signIn(req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (email === "" || password === "") {
      return res
        .status(401)
        .json({ success: false, message: "Can not leave any fields empty." });
    }
    const user = await fetchUserByEmail(email);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User Not Found." });
    }
    if (password !== user.password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password." });
    }
    res.cookie("email", email, { maxAge: 900000, httpOnly: true });
    res.json({ success: true, message: "Signin successful." });
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

async function signUp(req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const fullname = req.body.fullname;
    const user = await fetchUserByEmail(email);
    if (user) {
      return res.status(401).json({ success: false, message: "Email exists." });
    }
    await insertNewUser(email, password, fullname);
    return res.status(200).json({
      success: true,
      messsage: "Signup Successfully. Please sign in to continue.",
    });
  } catch (error) {
    console.error("Error during sign-up:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}
async function sendMail(req, res) {
  try {
    const receiver = await fetchUserByEmail(req.body.to);
    const receiverID = receiver.id;
    const sender = await fetchUserByEmail(req.cookies.email);
    const senderID = sender.id;
    const subject = req.body.subject;
    const body = req.body.body;
    let attachmentPath = null;
    if (req.file) {
      attachmentPath = `/uploads/${req.file.filename}`;
    }
    const mail = {
      subject: subject,
      body: body,
      attachment: attachmentPath,
    };
    await insertNewMail(mail);
    const mailID = await fetchMailID(mail.subject);
    const mailTrack = {
      senderID: senderID,
      receiverID: receiverID,
      mailID: mailID,
    };
    await insertMailTrack(mailTrack);
    return res
      .status(200)
      .json({ success: true, message: "Mail sent successfully." });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: "Internal server error.",
    });
  }
}

module.exports = { signIn, signUp, sendMail };
