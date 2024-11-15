const express = require('express')
const app = express()
const port = 5001
app.use(express.urlencoded({ extended: true }));

require('dotenv').config();


const cors = require('cors');

app.use(cors());

const user_data = require('./User_data.js')

const code = require('./code_snippet.js')

const notification = require('./notification.js')

app.use('/api/users', user_data);

app.use('/api/file', code);

app.use('/api/notification', notification);


const cron = require('node-cron');
const cleanOldNotifications = require('./notificationCleaner.js');


// cron.schedule('*/1 * * * *', () => {
//   console.log('Running the notification cleaner job');
//   cleanOldNotifications();
// });




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

