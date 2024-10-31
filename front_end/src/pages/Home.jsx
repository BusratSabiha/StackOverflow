import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./notification.jsx";

function Home() {
  const [posts, setPosts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [WantPost, setWantPost] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [file, setFile] = useState(null);
  const [codeContent, setCodeContent] = useState("");
  const [language, setLanguage] = useState("");
  const [FileUrl, setFileUrl] = useState("");

  const navigate = useNavigate();

  const fetchOthersPost = async (email) => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/users/othersposts",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      console.log("data: " + JSON.stringify(data));
      if (data.success) {
        setPosts(data.posts);
        console.log("************data.posts", data.posts);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/users/recentPosts"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data.posts);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    let email = localStorage.getItem("email");
    if (email) {
      setIsAuthenticated(true);
      fetchOthersPost(email);
    } else {
      setIsAuthenticated(false);
      fetchPosts();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("email");
    setIsAuthenticated(false);
    fetchPosts();
  };

  const handleWantToPost = () => {
    setWantPost(true);
  };

  const handleNotification = () => {
    navigate("/notify");
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!postContent && !codeContent) {
      setError("Post or code content cannot be empty.");
      return;
    }

    
    const formData = new FormData();
    formData.append("email", localStorage.getItem("email")); 
    formData.append("content", postContent);

    if (codeContent) {
      formData.append("codeContent", codeContent); 
      formData.append("language", language); 
    }

    if (file) {
      formData.append("file", file); 
    }

    try {
      const response = await fetch("http://localhost:5001/api/users/posts", {
        method: "POST",
        body: formData, 
      });

      const data = await response.json();

      if (data.success) {
        setPostContent("");
        setCodeContent("");
        setLanguage("");
        setFile(null);
        setPosts([...posts, data.post]); 
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to submit post. Please try again.");
    }
  };

  const handlePostClick = async (post) => {
    console.log("post id: " + post.post_id);
    if(post.code_content) {
      post.code_content = undefined;
      setPosts([... posts]);
      return ;
    }

    try {
      const response = await fetch(
        "http://localhost:5001/api/notification//fileURL",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: post.filename }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();

      
      if (data.success) {

        fetch(data.fileUrl)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
          })
          .then((data) => {
            console.log("File content:", data); 
            post["code_content"] = data.trim();
            console.log(posts)
            setPosts([... posts])
          })
          .catch((error) => {
            console.error("Error fetching the file:", error);
          });
      
        setFileUrl(data.fileUrl);
        console.log("************Data: ", data.fileUrl);
        // window.open(data.fileUrl, "_blank");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <nav>
          {isAuthenticated ? (
            <div>
              <button onClick={handleLogout}>Logout</button>
              <button onClick={handleWantToPost}>Post</button>
              <button onClick={handleNotification}>Notification</button>
            </div>
          ) : (
            <div>
              <Link to="/signin">Login</Link> |{" "}
              <Link to="/signup">Sign Up</Link>
            </div>
          )}
        </nav>

        <h1>Recent Posts</h1>

        {isAuthenticated && WantPost && (
          <div>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="postContent">Write a Post:</label>
                <textarea
                  id="postContent"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Write something..."
                  rows="4"
                  cols="50"
                />
              </div>

              <div>
                <label htmlFor="codeContent">Paste Your Code:</label>
                <textarea
                  id="codeContent"
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  placeholder="Paste your code here..."
                  rows="6"
                  cols="50"
                />
              </div>

              <div>
                <label htmlFor="language">Select Language:</label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="">Select Language</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                </select>
              </div>

              <div>
                <label htmlFor="fileInput">Upload a file:</label>
                <input type="file" id="fileInput" onChange={handleFileChange} />
              </div>

              <button type="submit">Submit</button>
            </form>
          </div>
        )}

        <ul className="posts-list">
          {posts.map((post, index) => (
            <li key={index} className="post">
              <div className="post-content">
                <p>
                  <strong>Email:</strong> {post.email}
                </p>
                <p>
                  <strong>Content:</strong> {post.content}
                </p>
                {/* <p>
                  <strong>Post ID:</strong> {post.post_id}
                </p> */}

                {post.codeContent && (
                  <div className="code-content">
                    <pre>
                      <code>{post.codeContent}</code>
                    </pre>
                    <p>
                      <strong>Language:</strong> {post.language}
                    </p>
                  </div>
                )}
                {post.filename && (
                  <div>
                    <p>
                      <strong>File:</strong>
                      <Link
                        to="#"
                        onClick={() => handlePostClick(post)}
                        style={{ color: "#535bf2" }}
                      >
                        {post.filename}
                      </Link>
                    </p>
                    <p className="code-content">
                      {post.code_content}
                    </p>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default Home;
