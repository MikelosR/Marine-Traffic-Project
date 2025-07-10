import { Footer, Header } from "../components";
import React from "react";
import { Link } from "react-router-dom";
import { NotFound404 } from "../assets";

function NotFound() {
  return (
    <div className="page-wrapper">
      <Header />
      <div
        style={{
          padding: "1rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <img src={NotFound404} alt="404" />
        <h1 className="title404">404 - Page Not Found</h1>
        <p className="text404">
          Oops! The page you're looking for does not exist.
        </p>
        <Link to="/" className="button404">
          Go back to Home
        </Link>
      </div>
      <Footer />
    </div>
  );
}

export default NotFound;
