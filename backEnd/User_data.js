const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const db = require("./database.js");

router.use(bodyParser.json());

router.post("/signup", async (req, res) => {
  // console.log(req.body);
  // return res.send(req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Invalid email or password, both must be provided" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO user_data (email, password) VALUES ($1, $2) RETURNING *",
      [email, hashedPassword]
    );
    return res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("Signup error:", err); 
    if (err.code === "23505") {
      
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
});






router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    
    const { rows } = await db.query(
      "SELECT * FROM user_data WHERE email = $1",
      [email]
    );

    
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = rows[0];

    console.log(user.id);

    
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid password" });
    }

    return res.status(200).json({
      message: "Authentication successful",
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});










/************************************************************************************ */

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { minioClient, bucketName } = require("./minioClient.js");






router.post("/posts", upload.single("file"), async (req, res) => {
  const { email, content, codeContent, language } = req.body;

  console.log("file uploaded", req.body);

  
  if (!email || !content) {
    return res.status(400).json({ error: " required: email and content." });
  }

  try {
    const { rows } = await db.query(
      "SELECT id FROM user_data WHERE email = $1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user_id = rows[0].id;

    const result = await db.query(
      `INSERT INTO user_posts (user_id, content) 
       VALUES ($1, $2) RETURNING *`,
      [user_id, content]
    );

    const newPost = result.rows[0];

    console.log("post_id from newPost", newPost.post_id);

    // const file = req.file;
    let fileUrl = "";
    let fileName = " ";
    let fileBuffer;
    let metaData = {
      "Content-Type": "text/plain",
    }

    if (req.file) {
      
      const file = req.file;
      metaData = {
        "Content-Type": file.mimetype,
      };
      fileBuffer = file.buffer;
      fileName = Date.now().toString() + file.originalname; 
    } else if (codeContent && language) {
      
      
      console.log("***The Language is:", language);

      if(language=="javascript") extension = "js";
      else if(language=="python") extension = "py";
      else if(language=="java") extension = "java";
      else if(language=="cpp") extension = "cpp";
      else if(language=="c") extension = "c";
      



      fileName = `${Date.now().toString()}${email}.${extension}`; 
      fileBuffer = Buffer.from(codeContent, "utf-8"); // Convert codeContent to buffer
      metaData = {
        "Content-Type": "text/plain", // Set the content type
      };
    } else {
      return res
        .status(400)
        .json({ error: "Code content or file is required." });
    }

    
    minioClient.putObject(
      bucketName,
      fileName,
      fileBuffer,
      fileBuffer.length,
      metaData,
      (err, etag) => {
        if (err) {
          console.log("Error uploading file:", err);
          return res.status(500).send("Error uploading file.");
        }

        // Generate a presigned URL to download the file
        minioClient.presignedUrl(
          "GET",
          bucketName,
          fileName,
          24 * 60 * 60,
          (err, presignedUrl) => {
            if (err) {
              console.log("Error generating presigned URL:", err);
              return res.status(500).send("Error generating download URL.");
            }

            console.log(presignedUrl);
            fileUrl = presignedUrl;
          }
        );
      }
    );
    // }

    
    const usersResult = await db.query(
      "SELECT id FROM user_data WHERE id != $1",
      [user_id]
    );

    const otherUsers = usersResult.rows;

    
    const notificationPromises = otherUsers.map((user) => {
      console.log("user_id", user_id);
      return db.query(
        `INSERT INTO notifications (user_id, post_id, message, is_read) 
         VALUES ($1, $2, $3, $4)`,
        [
          user.id,
          newPost.post_id,
          `A new post was created by user ${user_id}`,
          false,
        ]
      );
    });


  /////////////////////////////////////////////////////////////////////////////

  
   const filenameStore = await db.query (
   
    "INSERT INTO stored_files (post_id, filename) VALUES ($1, $2) RETURNING *",[newPost.post_id, fileName]

);




   










    
    await Promise.all(notificationPromises);

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      fileUrl: fileUrl,
      post: result.rows[0], 
    });
  } catch (error) {
    console.error("Error inserting post:", error);

    if (error.code === "23503") {
      return res
        .status(400)
        .json({ error: "Invalid user_id: User does not exist." });
    }

    return res
      .status(500)
      .json({ error: "An error occurred while creating the post." });
  }
});






router.get("/recentPosts", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT user_posts.content, user_data.email 
         FROM user_posts 
         JOIN user_data ON user_posts.user_id = user_data.id 
         ORDER BY user_posts.post_id DESC 
         LIMIT 15`
    );

    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No posts found" });
    }

    
    res.status(200).json({
      message: "Recent posts retrieved successfully",
      posts: result.rows, 
    });
  } catch (error) {
    console.error("Error retrieving recent posts:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching recent posts." });
  }
});



router.post("/othersposts", async (req, res) => {
  const { email } = req.body; 

  
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    
    const userResult = await db.query(
      "SELECT id FROM user_data WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const userId = userResult.rows[0].id;

    
    const postQuery = `
  SELECT 
    user_posts.content,
    user_posts.post_id, 
    user_data.email, 
    stored_files.filename
    FROM user_posts
  JOIN user_data ON user_posts.user_id = user_data.id
  LEFT JOIN stored_files ON user_posts.post_id = stored_files.post_id 
  WHERE user_posts.user_id != $1
  ORDER BY user_posts.post_id DESC
`;

    const postsResult = await db.query(postQuery, [userId]);
    
    // console.log("postsResult: " , postsResult);
    // Return the filtered posts
    res.status(200).json({
      success: true,
      posts: postsResult.rows,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "An error occurred while fetching posts." });
  }
});

module.exports = router;
