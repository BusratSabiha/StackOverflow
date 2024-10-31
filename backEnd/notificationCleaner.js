const db = require('./database.js'); 
const dayjs = require('dayjs');


async function cleanOldNotifications() {
  try {
    
    const twoMinutesAgo = dayjs().subtract(2, 'minute').format('YYYY-MM-DD HH:mm:ss');
    console.log("time:"+twoMinutesAgo);

    const result = await db.query(
      'DELETE FROM notifications WHERE is_read = true AND created_at < $1',
      [twoMinutesAgo]
    );

    console.log(`Deleted ${result.rowCount} old notifications`);
  } catch (error) {
    console.error('Error cleaning old notifications:', error);
  }
}

module.exports = cleanOldNotifications;
