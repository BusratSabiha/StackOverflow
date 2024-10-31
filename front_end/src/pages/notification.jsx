
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Post from "./post";


function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("email"); 

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/notification/unread",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();
        console.log(data)
        setNotifications(data.notifications);
        setMessage(data.message);

      } catch (err) {
        setError(err.message);

        console.log(err);
        setLoading(false);
      }
    };

    if (email) fetchNotifications();
  }, [email]);

  const handleNotificationClick = async (notification) => {
    
    await fetch(
      `http://localhost:5001/api/notification/markAsRead/${notification.id}`,
      {
        method: "POST",
      }
    );

    
    navigate(`/posts/${notification.post_id}`);
    
    setNotifications((prevNotifications) =>
      prevNotifications.map((n) =>
        n.id === notification.id ? { ...n, is_read: true } : n
      )
    );
  };

  //   if (loading) {
  //     return <p>Loading notifications...</p>;
  //   }

  //   if (error) {
  //     return <p>Error: {error}</p>;
  //   }

  const handleLogout = () => {
    localStorage.removeItem("email");
    navigate("/");
  };

  const handleHome = () => {
    navigate("/");
  };





  return (
    <div>
    <div>
      <button onClick = {handleLogout}>Logout</button>
       <button onClick = {handleHome}>Home</button> 
    </div>
    <div>
      <h1>Notifications</h1>
      {message}
      <ul>
        {notifications.map((notification) => (
          <li key={notification.id}>
            <Link
              to="#"
              onClick={() => handleNotificationClick(notification)}
              style={{
                color: notification.is_read ? "#ffffff" : "#535bf2",
                textDecoration: 'none'
              }}
            >
              <p>{notification.message}</p>
              
            <small>{new Date(notification.created_at).toLocaleString()}</small>
            </Link>
            
          </li>
        ))}
      </ul>
    </div>
  </div>
  );
}

export default Notifications;
