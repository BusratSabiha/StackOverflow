import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import Signup from './pages/signup.jsx';
import Signin from './pages/signin.jsx'; // Adjust the path as necessary
import Home from './pages/Home.jsx';
import Login from './pages/login.jsx';
import Notify from './pages/notification.jsx';
import Post from './pages/post.jsx';

function App() {

    



    return (

        <div>

        {/* {  (!isAuthenticated ) ? <Login /> : <div></div> } */}
        
            <Routes>
        
                <Route exact path="/" element={<Home />} />
                <Route exact path="/signup" element={<Signup />} />
                <Route exact path="/signin" element={<Signin />} />
                <Route exact path="/notify" element={<Notify />} />
                <Route path="/posts/:postId" element={<Post />} />
                {/* <Route exact path="/home" element={<Home />} /> */}
                
            </Routes>

            </div>

    );}


export default App;











