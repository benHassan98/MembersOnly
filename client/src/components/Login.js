import { useRef, useContext, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import "../styles/Form.css";

const Login = () => {
  const { setUser } = useContext(UserContext);
  const [, setCookie] = useCookies(["token"]);
  const navigate = useNavigate();
  const userNameRef = useRef();
  const passwordRef = useRef();
  const userNameErr = useRef();
  const passwordErr = useRef();
  const LoginRequest = (e) => {
    e.preventDefault();
    userNameRef.current.className = "form-control";
    passwordRef.current.className = "form-control";
    const refObj = { username: userNameRef, password: passwordRef };
    const errObj = { username: userNameErr, password: passwordErr };
    const request_options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: userNameRef.current.value,
        password: passwordRef.current.value,
      }),
    };
    fetch(process.env.REACT_APP_API_URL + "/login", request_options)
      .then(async (res) => {
        const isJson = res.headers
          .get("content-type")
          .includes("application/json");
        const data = isJson ? await res.json() : null;
        if (res.status === 500) {
          return Promise.reject(500);
        } else if (res.status === 400) {
          JSON.parse(data.message).forEach((err) => {
            refObj[err.param].current.className += " is-invalid";
            errObj[err.param].current.textContent = err.msg;
          });
        } else if (res.status === 401) {
          passwordRef.current.value = "";
          passwordRef.current.className += " is-invalid";
          passwordErr.current.textContent = "Wrong UserName/Password";
        } else {
          setCookie("token", data.token, { sameSite: "none", secure: true });
          setUser(data.user);
          navigate("/");
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="form-div">
      <h1>Login</h1>
      <form data-testid="form">
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            UserName
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            name="username"
            ref={userNameRef}
            data-testid="username"
            required
          />
          <div className="invalid-feedback" ref={userNameErr}></div>
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            ref={passwordRef}
            data-testid="password"
            required
          />
          <div
            className="invalid-feedback"
            ref={passwordErr}
            data-testid="invalid-feedback"
          ></div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          onClick={(e) => LoginRequest(e)}
        >
          LogIn
        </button>
      </form>
    </div>
  );
};

export default Login;
