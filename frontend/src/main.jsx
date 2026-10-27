import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./main.css";

const pennyMountPoint = document.getElementById("root");

createRoot(pennyMountPoint).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
