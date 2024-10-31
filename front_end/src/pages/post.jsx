


import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate} from "react-router-dom";

function Post() {
  const { postId } = useParams(); 
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const email = localStorage.getItem("email"); 
  const navigate = useNavigate();


  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/notification/posts/${postId}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }

        setPost(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleFile = async () => {
    try {
      if (post?.code_content) {
        setPost(prevPost => ({
          ...prevPost,
          code_content: undefined,
        }));
        return;
      }

      const response = await fetch('http://localhost:5001/api/notification/fileURL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: post.filename }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }

      const data = await response.json();
      if (data.success) {
        const fileResponse = await fetch(data.fileUrl);
        if (!fileResponse.ok) {
          throw new Error(`HTTP error! Status: ${fileResponse.status}`);
        }
        const fileContent = await fileResponse.text();
        setPost(prevPost => ({
          ...prevPost,
          code_content: fileContent.trim(),
        }));
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <p>Loading post...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const handleLogout = () => {
    localStorage.removeItem("email");
    navigate("/");
  };

  const handleHome = () => {
    navigate("/");
  };

  const handleNotify= () => {
    navigate("/notify");
  };





  return (
    <div>
      <div>
      <button onClick = {handleLogout}>Logout</button>
       <button onClick = {handleHome}>Home</button>
       <button onClick = {handleNotify}>Notification</button>

    </div>
      <h1>Post Details</h1>
      {post && (
        <>
          <p>
            <strong>Content:</strong> {post.content}
          </p>            
          <p>
            <small>File name:
              <Link to="#" onClick={handleFile} style={{ color: "#535bf2" }}>
                {post.filename}
              </Link>
            </small>
          </p>
          {post.code_content && (
            <p className="code-content">
              {post.code_content}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default Post;

