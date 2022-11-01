import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Form.css";

const Signup = () => {
  const userNameRef = useRef();
  const userNameErr = useRef();
  const passwordRef = useRef();
  const passwordErr = useRef();
  const passwordConfirmRef = useRef();
  const passwordConfirmErr = useRef();
  const navigate = useNavigate();
  const signupRequest = (e) => {
    e.preventDefault();
    userNameRef.current.className = "form-control";
    passwordRef.current.className = "form-control";
    passwordConfirmRef.current.className = "form-control";
    const refObj = {
      username: userNameRef,
      password: passwordRef,
      passwordconfirm: passwordConfirmRef,
    };
    const errObj = {
      username: userNameErr,
      password: passwordErr,
      passwordconfirm: passwordConfirmErr,
    };
    const request_options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: userNameRef.current.value,
        password: passwordRef.current.value,
        passwordconfirm: passwordConfirmRef.current.value,
      }),
    };

    fetch(process.env.REACT_APP_API_URL + "/signup", request_options)
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
        } else {
          navigate("/login");
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="form-div">
      <h1>Signup</h1>
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
          <span>*Your password must be at least 5 characters long.</span>
          <div className="invalid-feedback" ref={passwordErr}></div>
        </div>
        <div className="mb-3">
          <label htmlFor="passwordconfirm" className="form-label">
            Password Confirm
          </label>
          <input
            type="password"
            className="form-control"
            id="passwordconfirm"
            name="passwordconfirm"
            ref={passwordConfirmRef}
            data-testid="passwordconfirm"
            required
          />
          <div className="invalid-feedback" ref={passwordConfirmErr}></div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          onClick={(e) => signupRequest(e)}
        >
          Signup
        </button>
      </form>
    </div>
  );
};

export default Signup;
