const Minio = require('minio');

// Initialize the Minio client
const minioClient = new Minio.Client({
    endPoint: 'localhost', // Your MinIO server endpoint
    port: 9000, // The port where MinIO is running
    useSSL: false, // Use SSL if applicable
    accessKey: "ujwACDzgcLOCkzHYZbfM", // Your Access Key
    secretKey: "IvUs7h2jU2wnHCJjowKLCnW3J3ff6dTna1q6qIz4"  // Your Secret Key
});

// Define your bucket name (this is similar to S3's bucket)
const bucketName = 'code-snippet';

module.exports =  {minioClient, bucketName};
