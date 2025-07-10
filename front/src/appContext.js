import React, { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";

// Create Context
const AppContext = createContext();

// Context Provider Component
export const ContextProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState((Cookies.get("role") || "GUEST"));
  const [user, setUser] = useState(null); // Start with null
  const [zoneSelected, setZoneSelected] = useState(false);
  const [savedZone, setSavedZone] = useState(null);


  useEffect(() => {
    const token = Cookies.get("token");
    const savedRole = Cookies.get("role");

    if (token) {
      setIsLoggedIn(true);
      if (savedRole) setRole(savedRole);
    }
  }, []);

  // login
  const login = ({ token, role }) => {
    Cookies.set("token", token, { expires: 7 });
    Cookies.set("role", role, { expires: 7 });

    setRole(role);
    setIsLoggedIn(true);
  };

  // logout
  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("role");

    setUser(null);
    setIsLoggedIn(false);
    setRole("GUEST");
  };

  const checkAuth = () => {
    const token = Cookies.get("token");
    return !!(token);
  }


  const value = {
    isLoggedIn,
    setIsLoggedIn,
    isAdmin: role === "ADMIN",
    role,
    user,
    setUser,
    login,
    logout,
    checkAuth,
    savedZone,
    setSavedZone,
    zoneSelected,
    setZoneSelected
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
