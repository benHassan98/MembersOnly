import React, { useEffect, useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import BecomeAdmin from "./components/BecomeAdmin";
import BecomeMember from "./components/BecomeMember";
import CreateMessage from "./components/CreateMessage";
import Error from "./components/Error";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { CookiesProvider } from "react-cookie";
import { UserContext } from "./components/UserContext";

const App = () => {
  const { setUser } = useContext(UserContext);
  useEffect(() => {
    fetch(process.env.REACT_APP_API_URL + "/user", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (res.status >= 401) {
          return Promise.reject(res.status);
        } else {
          return res.json();
        }
      })
      .then((res) => setUser(res.user))
      .catch((err) => console.error("There was an error !!", err));
  }, []);

  return (
    <CookiesProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/create_message" element={<CreateMessage />} />
          <Route path="/become_admin" element={<BecomeAdmin />} />
          <Route path="/become_member" element={<BecomeMember />} />
          <Route path="*" element={<Error code={404} />} />
        </Routes>
      </BrowserRouter>
    </CookiesProvider>
  );
};

export default App;
