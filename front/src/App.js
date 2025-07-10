import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/login.jsx";
import Index from "./pages/index.jsx";
import Vessels from "./pages/vessels.jsx";
import MyFleet from "./pages/my-fleet.jsx";
import ShipPage from "./pages/ship-page.jsx";
import SignUp from "./pages/sign-up.jsx";
import { ContextProvider } from "./appContext.js";
import { ProtectedRoute } from "./components";
import NotFound from "./pages/not-found";
import About from "./pages/about.jsx";
import PrivacyPolicy from "./pages/privacy-policy.jsx";
import PastTrack from "./pages/past-track.jsx";

function App() {
  return (
    <ContextProvider>
      <div className="App">
        <BrowserRouter>
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
            <Route path="/about" element={<About />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/vessels" element={<Vessels />} />
            <Route path="/ships/:id" element={<ShipPage />} />
            <Route path="/" element={<Index />} />
            <Route path="/past-track/:mmsi" element={<PastTrack />} />

            {/* PROTECTED */}
            <Route
              path="/my-fleet"
              element={<ProtectedRoute element={MyFleet} />}
            />

            {/*404*/}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ContextProvider>
  );
}

export default App;
