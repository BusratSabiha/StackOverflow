import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import './signup.css';
import { isValidEmail, isValidPassword } from './validation'; 
// import './userinterface';
import './Home.jsx'; 

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleInput = (event) => {
        const { name, value } = event.target;
        if (name === 'email') {
            setEmail(value);
        } else if (name === 'password') {
            setPassword(value);
        } else if (name === 'confirmPassword') {
            setConfirmPassword(value);
        }
    };

    const handleSubmit = async(event) => {
        event.preventDefault();

        if (!isValidEmail(email)) {
            setError('Invalid email format.');
            return;
        }

        if (!isValidPassword(password)) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        

        try {
            const response = await fetch('http://localhost:5001/api/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            }); 

            const data = await response.json();
            if (data.success) {
                
                localStorage.setItem('email', email);
                localStorage.setItem('user_id', data.user.id);
                navigate('/', { state: { user: data.user } });
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to sign up. Please try again.');
        }
        
        
        // navigate('/UserInterface');
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="text-center mb-3">
                <p>Sign up with:</p>
                
            </div>
            {/* <p className="text-center">or:</p> */}

            <label className="form-label" htmlFor="signupEmail">Email</label>
            {error && <p className="text-center text-danger">{error}</p>}
            <div className="form-outline mb-4">
                <input
                    type="email"
                    id="signupEmail"
                    name="email"
                    placeholder='Enter your email address'
                    className="form-control"
                    value={email}
                    onChange={handleInput}
                    required
                />
                {/* <label className="form-label" htmlFor="signupEmail">Email</label> */}
            </div>
            <label className="form-label" htmlFor="signupPassword">Password</label>
            <div className="form-outline mb-4">
                <input
                    type="password"
                    id="signupPassword"
                    name="password"
                    placeholder='Enter your password'
                    className="form-control"
                    value={password}
                    onChange={handleInput}
                    required
                />
                {/* <label className="form-label" htmlFor="signupPassword">Password</label> */}
            </div>

            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="form-outline mb-4">
                <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder='Confirm Password'
                    className="form-control"
                    value={confirmPassword}
                    onChange={handleInput}
                    required
                />
                {/* <label className="form-label" htmlFor="confirmPassword">Confirm Password</label> */}
            </div>
            <button type="submit" className="btn btn-primary btn-block mb-4">Sign up</button>
            <div className="text-center">
                <p>Already a member? <Link to="/signin">Sign in</Link></p> 
            </div>
        </form>
    );
}

export default Signup;
