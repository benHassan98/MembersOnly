import React, { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { useCookies } from "react-cookie";
import "../styles/Form.css";
const BecomeMember = () => {
  const { user, setUser } = useContext(UserContext);
  const [auth, setAuth] = useState(true);
  const [, , removeCookie] = useCookies(["token"]);
  const navigate = useNavigate();
  const memberPassword = useRef();
  const memberRequest = (e) => {
    e.preventDefault();
    memberPassword.current.className = "form-control";
    const request_options = {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: user.userName,
        memberpassword: memberPassword.current.value,
      }),
    };
    fetch(process.env.REACT_APP_API_URL + "/become_member", request_options)
      .then((res) => {
        if (res.status === 200) {
          setUser({ ...user, isMember: true });
          navigate("/");
        } else if (res.status === 400)
          memberPassword.current.className += " is-invalid";
        else if (res.status === 401) {
          setAuth(false);
        } else {
          return Promise.reject(500);
        }
      })
      .catch((err) => console.error(err));
  };
  useEffect(() => {
    const request_options = {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: user.userName,
      }),
    };
    fetch(process.env.REACT_APP_API_URL + "/check_token", request_options).then(
      (res) => {
        if (!res.ok) {
          setAuth(false);
        } else setAuth(true);
      }
    );
  }, []);

  useEffect(() => {
    if (!auth) {
      removeCookie("token");
      setUser({});
      navigate("/login");
    }
  }, [auth]);

  return (
    <div className="form-div">
      <h1>Join Clubhouse</h1>
      <form data-testid="form">
        <div className="mb-3">
          <label htmlFor="memberPassword" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="memberPassword"
            name="memberPassword"
            data-testid="memberpassword"
            ref={memberPassword}
          />
          <div className="invalid-feedback" data-testid="invalid-feedback">
            Wrong Clubhouse Password
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          onClick={(e) => memberRequest(e)}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default BecomeMember;
