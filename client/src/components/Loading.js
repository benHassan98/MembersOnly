import React from "react";
import "../styles/Loading.css";

const Loading = () => {
  return (
    <div className="spinner">
      <div
        className="spinner-grow"
        style={{ width: "10rem", height: "10rem" }}
      ></div>
      
    </div>
  );
};

export default Loading;
