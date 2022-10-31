import React, { useEffect, useRef, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { useCookies } from "react-cookie";
import "../styles/Form.css";

const CreateMessage = () => {
  const { user } = useContext(UserContext);
  const [auth, setAuth] = useState(true);
  const [, , removeCookie] = useCookies(["token"]);
  const titleRef = useRef();
  const contentRef = useRef();
  const navigate = useNavigate();

  const createRequest = (e) => {
    e.preventDefault();
    titleRef.current.className = "form-control";
    contentRef.current.className = "form-control";
    const errObj = { title: titleRef, content: contentRef };
    const request_options = {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: user.userName,
        title: titleRef.current.value,
        content: contentRef.current.value,
      }),
    };
    fetch(process.env.REACT_APP_API_URL + "/message/create", request_options)
      .then(async (res) => {
        const isJson = res.headers
          .get("content-type")
          .includes("application/json");
        const data = isJson ? await res.json() : null;
        if (res.status === 200) navigate("/");
        else if (res.status === 400) {
          JSON.parse(data.message).forEach((err) => {
            errObj[err.param].current.className += " is-invalid";
          });
        } else if (res.status == 401) {
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
      <h1>Create Messsage</h1>
      <form data-testid="form">
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            Title
          </label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            ref={titleRef}
            data-testid="title"
            required
          />
          <div className="invalid-feedback" data-testid="titleInvalid-feedback">
            You'r message misses the title
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="content" className="form-label">
            Content
          </label>
          <textarea
            className="form-control"
            rows="3"
            id="content"
            name="content"
            ref={contentRef}
            data-testid="content"
            required
          ></textarea>
          <div
            className="invalid-feedback"
            data-testid="contentInvalid-feedback"
          >
            You'r message misses the content
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          onClick={(e) => createRequest(e)}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default CreateMessage;
