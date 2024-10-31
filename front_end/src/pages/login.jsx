
import { Link } from "react-router-dom"; // Import the Link component





function LogIn() {
  return (
    <>
      <p>Already a user? <Link to="/Signin">Sign In</Link></p>
      <p>New user? <Link to="/Signup">Sign Up</Link></p>
    </>
  );
}


export default LogIn;
