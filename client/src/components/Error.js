import React, { useContext } from "react";
import {useNavigate} from 'react-router-dom';
import { useCookies } from "react-cookie";
import { UserContext } from "./UserContext";
import "../styles/Error.css";

const Error = ({ code }) => {
  const { setUser } = useContext(UserContext);
  const [, , removeCookie] = useCookies(["token"]);
  const navigate = useNavigate();
  const errObj = {
    401: {
      h2: "Unauthorized",
      p: "Please Login first",
    },
    404: {
      h2: "Oops! This Page Could Not Be Found",
      p: "Sorry but the page you are looking for does not exist, have been removed. name changed or is temporarily unavailable",
    },
    500: {
      h2: "Internal Server error !",
      p: "We're unable to find out what's happening! We suggest you to Go Back or visit here later.",
    },
    "Something went wrong": {
      h2: "",
      p: "",
    },
  };
  let btn = null;
  if (code === 401) {
    removeCookie("token");
    // setUser({});
    btn = <button className="btn btn-primary" onClick={() => navigate("/login")}>
       Login
    </button>
  } else if (code === 404)
    btn = (
      <button className="btn btn-primary" onClick={() => navigate("/")}>
        Go To Homepage
      </button>
    );
  else if (code === 500)
    btn = (
      <button className="btn btn-primary" onClick={() => navigate(-1)}>
        Go Back
      </button>
    );
  return (
    <div className="error">
      <div className="code">
        <h1>{code}</h1>
      </div>
      <h2>{errObj[code].h2}</h2>
      <p>{errObj[code].p}</p>
      {btn}
    </div>
  );
};

export default Error;
