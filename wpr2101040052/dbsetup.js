const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "wpr",
  password: "fit2023",
  database: "wpr2023",
  port: 3306
});

async function setUpTables() {
  try {
    await pool.query("DROP TABLE IF EXISTS mailTrack");
    await pool.query("DROP TABLE IF EXISTS mail");
    await pool.query("DROP TABLE IF EXISTS users");
    await pool.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(50) NOT NULL,
        fullname VARCHAR(255) NOT NULL
      );
    `);
    await pool.query(`
      INSERT IGNORE INTO users(email, password, fullname) VALUES('a@a.com', 'a@a.com', 'Aaron Ann');
    `);
    await pool.query(`
      INSERT IGNORE INTO users(email, password, fullname) VALUES('1@1gmail.com', '123456', 'Pham Pham 1');
    `);
    await pool.query(`
      INSERT IGNORE INTO users(email, password, fullname) VALUES('2@2gmail.com', '123456', 'Pham Pham 2');
    `);
    await pool.query(`
      CREATE TABLE mail (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        attachment_path VARCHAR(255) 
      );
    `);
    await pool.query(`
      INSERT IGNORE INTO mail(subject, body) VALUES('Subject 1', 'This is a demo body');
    `);
    await pool.query(`
      INSERT IGNORE INTO mail(subject, body) VALUES('Subject 2', 'This is a demo body');
    `);
    await pool.query(`
      INSERT IGNORE INTO mail(subject, body) VALUES('Subject 3', 'This is a demo body');
    `);
    await pool.query(`
      INSERT IGNORE INTO mail(subject, body) VALUES('Subject 4', 'This is a demo body');
    `);
    await pool.query(`
      INSERT IGNORE INTO mail(subject, body) VALUES('Subject 5', 'This is a demo body');
    `);
    await pool.query(`
      INSERT IGNORE INTO mail(subject, body) VALUES('Subject 6', 'This is a demo body');
    `);
    await pool.query(`
      INSERT IGNORE INTO mail(subject, body) VALUES('Subject 7', 'This is a demo body');
    `);
    await pool.query(`
      INSERT IGNORE INTO mail(subject, body) VALUES('Subject 8', 'This is a demo body');
    `);

    await pool.query(`
      CREATE TABLE mailTrack (
        senderID INT NOT NULL,
        receiverID INT NOT NULL,
        mailID INT NOT NULL,
        createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (senderID) REFERENCES users(id),
        FOREIGN KEY (receiverID) REFERENCES users(id),
        FOREIGN KEY (mailID) REFERENCES mail(id),
        PRIMARY KEY (senderID, receiverID, mailID) 
      );
    `);
    // 3 sent 1 a mailID 1
    await pool.query(`
        INSERT IGNORE INTO mailTrack(senderID, receiverID, mailID) VALUES (3, 1, 1)
    `);
    await pool.query(`
        INSERT IGNORE INTO mailTrack(senderID, receiverID, mailID) VALUES (2, 1, 2)
    `);
    await pool.query(`
        INSERT IGNORE INTO mailTrack(senderID, receiverID, mailID) VALUES (1, 2, 3)
    `);
    await pool.query(`
        INSERT IGNORE INTO mailTrack(senderID, receiverID, mailID) VALUES (1, 3, 4)
    `);
    await pool.query(`
        INSERT IGNORE INTO mailTrack(senderID, receiverID, mailID) VALUES (2, 3, 5)
    `);
    await pool.query(`
        INSERT IGNORE INTO mailTrack(senderID, receiverID, mailID) VALUES (3, 2, 6)
    `);
    await pool.query(`
        INSERT IGNORE INTO mailTrack(senderID, receiverID, mailID) VALUES (3, 1, 7)
    `);
    await pool.query(`
        INSERT IGNORE INTO mailTrack(senderID, receiverID, mailID) VALUES (3, 1, 8)
    `);
    await pool.query(`
        INSERT IGNORE INTO mailTrack(senderID, receiverID, mailID) VALUES (2, 1, 3)
    `);
    await pool.query(`
        INSERT IGNORE INTO mailTrack(senderID, receiverID, mailID) VALUES (2, 1, 4)
    `);
    await pool.query(`
        INSERT IGNORE INTO mailTrack(senderID, receiverID, mailID) VALUES (2, 1, 5)
    `);
    console.log("Tables set up successfully");
  } catch (error) {
    console.error("Error setting up tables:", error);
  }
}

async function getPaginatedData(table, pageNumber, itemsPerPage) {
  try {
    const offset = (pageNumber - 1) * itemsPerPage;

    const connection = await pool.getConnection();

    const query = `
      SELECT * FROM ${table}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await connection.execute(query, [itemsPerPage, offset]);

    connection.release();

    return rows;
  } catch (error) {
    console.error("Error fetching paginated data:", error);
    throw error;
  }
}

async function fetchUserByEmail(email) {
  try {
    const [rows, fields] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return rows[0];
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
}
async function fetchUsers() {
  const [users, fields] = await pool.query("SELECT email FROM users");
  return users;
}

async function insertNewUser(email, password, fullname) {
  try {
    await pool.query(
      "INSERT INTO users (email, password, fullname) VALUES (?, ? , ?)",
      [email, password, fullname]
    );
  } catch (error) {
    console.error("Error inserting user:", error);
    throw error;
  }
}

async function insertNewMail(mail) {
  try {
    await pool.query(
      " INSERT IGNORE INTO mail(subject, body, attachment_path) VALUES(?, ? , ?);",
      [mail.subject, mail.body, mail.attachment]
    );
  } catch (error) {
    console.error("Error insertting new mail:", error);
  }
}

async function fetchMailID(subject){
  try {
    const [rows, fields] = await pool.query("SELECT id FROM mail WHERE subject = ?", [subject])
    return rows[0].id;
  } catch (error) {
    console.error("Error insertting new mail:", error);
  }
}
async function fetchMailByID(mailID) {
  try {
    const [rows, fields] = await pool.query(
      "SELECT * FROM mail WHERE id = ?",
      [mailID]
    );

    return rows[0];
  } catch (error) {
    console.error("Error insertting new mail:", error);
  }
}

async function insertMailTrack(mailTrack) {
  try {
    await pool.query(
      " INSERT IGNORE INTO mailTrack(senderID, receiverID, mailID) VALUES(? , ? , ?);",
      [mailTrack.senderID, mailTrack.receiverID, mailTrack.mailID]
    );
  } catch (error) {
    console.error("Error insertting new mail:", error);
  }
}

async function fetchEmailsInBox(email, page, pageSize) {
  try {
    const [userData] = await pool.query(
      "SELECT id, fullname FROM users WHERE email = ?",
      [email]
    );

    if (!userData || userData.length === 0) {
      console.error("User not found for email:", email);
      return [];
    }

    const userId = userData[0].id;
    const offset = (page - 1) * pageSize;

    const [countResult] = await pool.query(
      "SELECT COUNT(*) AS totalCount FROM mailTrack WHERE receiverID = ?",
      [userId]
    );
    const totalEmails = countResult[0].totalCount;

    const mailTracks = await pool.query(
      "SELECT senderID, mailID, createAt FROM mailTrack WHERE receiverID = ? LIMIT ? OFFSET ?",
      [userId, pageSize, offset]
    );

    const emailInfos = [];
    for (const mailTrack of mailTracks[0]) {
      const senderID = mailTrack.senderID;
      const senderQuery = await pool.query(
        "SELECT fullname FROM users WHERE id = ?",
        [senderID]
      );

      const mailID = mailTrack.mailID;
      const mailQuery = await pool.query(
        "SELECT subject, body FROM mail WHERE id = ?",
        [mailID]
      );
      const date = new Date(mailTrack.createAt);
      const emailInfo = {
        mailID: mailID,
        senderName: senderQuery[0][0].fullname,
        subject: mailQuery[0][0].subject,
        body: mailQuery[0][0].body,
        date: date.toLocaleString(),
      };
      emailInfos.push(emailInfo);
    }
    const totalPages = Math.ceil(totalEmails / pageSize);

    return {
      emails: emailInfos,
      fullname: userData[0].fullname,
      totalPages: totalPages,
    };
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
}

async function fetchEmailsOutBox(email, page, pageSize) {
  try {
    const [userData] = await pool.query(
      "SELECT id, fullname FROM users WHERE email = ?",
      [email]
    );

    if (!userData || userData.length === 0) {
      console.error("User not found for email:", email);
      return [];
    }

    const userId = userData[0].id;
    const offset = (page - 1) * pageSize;

    const [countResult] = await pool.query(
      "SELECT COUNT(*) AS totalCount FROM mailTrack WHERE senderID = ?",
      [userId]
    );
    const totalEmails = countResult[0].totalCount;

    const mailTracks = await pool.query(
      "SELECT receiverID, mailID, createAt FROM mailTrack WHERE senderID = ? LIMIT ? OFFSET ?",
      [userId, pageSize, offset]
    );

    const emailInfos = [];
    for (const mailTrack of mailTracks[0]) {
      const receiverID = mailTrack.receiverID;
      const receiverQuery = await pool.query(
        "SELECT fullname FROM users WHERE id = ?",
        [receiverID]
      );

      const mailID = mailTrack.mailID;
      const mailQuery = await pool.query(
        "SELECT subject, body FROM mail WHERE id = ?",
        [mailID]
      );
      const date = new Date(mailTrack.createAt);
      const emailInfo = {
        mailID: mailID,
        senderName: receiverQuery[0][0].fullname,
        subject: mailQuery[0][0].subject,
        body: mailQuery[0][0].body,
        date: date.toLocaleString(),
      };
      emailInfos.push(emailInfo);
    }
    const totalPages = Math.ceil(totalEmails / pageSize);

    return {
      emails: emailInfos,
      fullname: userData[0].fullname,
      totalPages: totalPages,
    };
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
}

if (require.main === module) {
  setUpTables().then(() => {
    pool.end();
  });
} else {
  module.exports = {
    getPaginatedData,
    fetchUserByEmail,
    insertNewUser,
    fetchEmailsInBox,
    fetchEmailsOutBox,
    fetchUsers,
    insertNewMail,
    insertMailTrack,
    fetchMailID,
    fetchMailByID,
  };
}
