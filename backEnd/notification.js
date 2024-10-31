const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const db = require("./database.js");

router.use(bodyParser.json());



router.post('/unread', async (req, res) => {
    const { email } = req.body;
  
   
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }
  
    try {

        const { rows }  = await db.query(
           'SELECT id FROM user_data WHERE email = $1',[email]
        );

        if (rows.length === 0) {
          console.log("no notifications")
            return res.status(404).json({ 
              error: 'user not found with email',
              message: 'sorry, There isnt any notification for you' });
        }
        const user_id = rows[0].id;
        console.log(user_id);
      


      const userResult = await db.query(
        "SELECT id, post_id, message, is_read, created_at  FROM notifications  WHERE user_id = $1  ORDER BY created_at DESC",
        [user_id]
      );

      console.log("notification er user result:  " ,userResult);
  
      const notifications = userResult.rows;


      let message = notifications.length === 0 ? 'No notifications found' : ''

      
  
     
 
  
      res.json({notifications : notifications, message: message});

    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      res.status(500).json({ error: 'An error occurred while fetching unread notifications.' });
    }
  });
  


  router.get('/posts/:postId', async (req, res) => {
    const { postId } = req.params;

    console.log(postId);
  
    try {
      const { rows } = await db.query(
        `SELECT user_posts.*, stored_files.filename
         FROM user_posts
         JOIN stored_files ON user_posts.post_id = stored_files.post_id
         WHERE user_posts.post_id = $1`,[postId] 

      );

      console.log("postID************: " + postId);
      console.log("rows****************: " + rows);
  
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      console.log("Rows are: " + JSON.stringify(rows, null, 2));

      
  
      return res.json(rows[0]);

      // console.log("bla bla bla: " + res.json(rows[0]));
    } catch (error) {
      console.error('Error fetching post:', error);
      return res.status(500).json({ error: 'An error occurred while fetching the post.' });
    }
  });



    
    router.post('/markAsRead/:notificationId', async (req, res) => {
    const { notificationId } = req.params;  
  
    
    if (!notificationId) {
      return res.status(400).json({ 
        success: false,
        message: 'Notification ID is required' 
      });
    }
  
    try {
      
      const result = await db.query(
        'UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *',
        [notificationId]
      );
  
      
      if (result.rowCount === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Notification not found' 
        });
      }
  
      
      res.json({
        success: true,
        message: 'Notification marked as read',
        notification: result.rows[0]  
      });
  
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ 
        success: false, 
        message: 'An error occurred while updating the notification' 
      });
    }
  });


  const { minioClient, bucketName } = require("./minioClient.js");

  
  router.post('/fileURL', async (req, res) => {

   const fileName = req.body.filename;
   console.log("file name is: ",fileName);

   if(!fileName)  return res.status(400).json({ 
    success: false,
    message: 'File name is required' 
  });
  

   try{ 

    const result = await minioClient.presignedUrl(
      "GET",
      bucketName,
      fileName,
      24 * 60 * 60,
      (err, presignedUrl) => {
        if (err) {
          console.log("Error generating presigned URL:", err);
          return res.status(500).send("Error generating download URL.");
        }
  
        // console.log(presignedUrl);
        fileUrl = presignedUrl;
        return res.status(200).json({
          success: true,
          fileUrl: presignedUrl,
        });
      }
    );

   }catch(error){

    console.error('Error marking to get FileUrl', error);
      res.status(500).json({ 
        success: false, 
        message: 'An error occurred to get fileUrl' 
      });

    


   }





    
    






    
  });

  









module.exports = router;