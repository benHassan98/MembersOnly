import React, { useContext } from "react";
import { Link,useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { UserContext } from "./UserContext";
const Header = () => {
  const { user, setUser } = useContext(UserContext);
  const { userName, isAdmin, isMember } = user;
  const [, , removeCookie] = useCookies(["token"]);
  const navigate = useNavigate();
  const LogOut = () => {
    const request_options = {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: userName,
      }),
    };
    fetch(process.env.REACT_APP_API_URL + "/logout", request_options)
      .then((res) => {
        if (res.status !== 500) {
          removeCookie("token");
          setUser({});
          navigate('/');
        } else {
          return Promise.reject(500);
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="container" style={{ width: "80vw" }}>
      <header className="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
        <Link
          to={"/"}
          className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none"
        >
          <span className="fs-4">Members Only</span>
        </Link>

        <ul className="nav nav-pills">
          <li className="nav-item">
            <Link to={"/"} className="nav-link">
              Home
            </Link>
          </li>

          {!userName && (
            <li className="nav-item">
              <Link to={"/login"} className="nav-link">
                Log in
              </Link>
            </li>
          )}
          {!userName && (
            <li className="nav-item">
              <Link to={"/signup"} className="nav-link">
                Sign up
              </Link>
            </li>
          )}
          {userName && (
            <li className="nav-item">
              <button className="nav-link" onClick={() => LogOut()}>
                Log out
              </button>
            </li>
          )}
          {userName && (
            <li className="nav-item">
              <Link to={"/create_message"} className="nav-link">
                Create Message
              </Link>
            </li>
          )}
          {userName && !isAdmin && (
            <li className="nav-item">
              <Link to={"/become_admin"} className="nav-link">
                Become Admin
              </Link>
            </li>
          )}
          {userName && !isMember && (
            <li className="nav-item">
              <Link to={"/become_member"} className="nav-link">
                Join Clubhouse
              </Link>
            </li>
          )}
        </ul>
      </header>
    </div>
  );
};

export default Header;
