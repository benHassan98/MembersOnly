import { useState, useEffect, useContext } from "react";
import { useCookies } from "react-cookie";
import { UserContext } from "./UserContext";
import Loading from "./Loading";
import "../styles/HomePage.css";
import "../styles/App.css";
import { useNavigate } from "react-router-dom";
const HomePage = () => {
  const [messages, setMessages] = useState(undefined);
  const { user, setUser } = useContext(UserContext);
  const { userName, isAdmin, isMember } = user;
  const [, , removeCookie] = useCookies(["token"]);
  const navigate = useNavigate();
  const delete_request = (id) => {
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

    fetch(
      process.env.REACT_APP_API_URL + "/message/delete/" + id,
      request_options
    )
      .then((res) => {
        if (res.status === 401) {
          removeCookie("token");
          setUser({});
          navigate("/login");
        } else if (res.status === 500) {
          return Promise.reject(500);
        } else {
          setMessages(messages.filter((message) => message._id !== id));
        }
      })
      .catch((err) => console.error(err));
  };
  useEffect(() => {
    fetch(process.env.REACT_APP_API_URL + "/message/all")
      .then((res) => {
        if (!res.ok) {
          return Promise.reject(500);
        } else {
          return res.json();
        }
      })
      .then((res) => {
        setMessages(res.documents.reverse());
      })
      .catch((err) => {
        console.error("There was an error !!", err);
      });
  }, []);

  if (!messages) return <Loading />;
  else {
    return (
      <>
        {userName && <h1>{"Welcome " + userName + "!!"}</h1>}
        <div className="cards">
          {messages.map((message, id) => {
            return (
              <div className="card" style={{ width: "80vw" }} key={id}>
                {isAdmin && (
                  <button
                    className="btn btn-outline-danger align-self-end"
                    style={{
                      width: " 2rem",
                      height: "2rem",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onClick={() => delete_request(message._id)}
                  >
                    X
                  </button>
                )}
                <div className="card-body">
                  <h5 className="card-title">{message.title}</h5>
                  <p className={"card-text " + (isMember ? "" : "text-muted")}>
                    Author: {isMember ? message.author.userName : "Unknown"}
                  </p>
                  <p className="card-text">{message.content}</p>
                </div>
                <div
                  className={"card-footer " + (isMember ? "" : "text-muted")}
                >
                  Created At: {isMember ? message.time_stamp : "Unknown"}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  }
};

export default HomePage;
