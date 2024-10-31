const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); 
const app = express();

// const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const db = require("./database.js");

const { minioClient, bucketName } =  require('./minioClient.js');

router.use(bodyParser.json());



router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const file = req.file;
    const metaData = {
        'Content-Type': file.mimetype
    };

    
  minioClient.putObject(bucketName, file.originalname, file.buffer, file.size, metaData, (err, etag) => {
    if (err) {
      console.log('Error uploading file:', err);
      return res.status(500).send('Error uploading file.');
    }

        
    minioClient.presignedUrl('GET', bucketName, file.originalname, 24*60*60, (err, presignedUrl) => { 
        if (err) {
          console.log('Error generating presigned URL:', err);
          return res.status(500).send('Error generating download URL.');
        }
  
        res.json({
          message: 'File uploaded successfully',
          downloadUrl: presignedUrl
        });
      });

    });
});

module.exports = router;