"use client";

import { createContext, useEffect, useState } from "react";

export const Context = createContext();

const AppProvider = ({ children }) => {
  const [state, setState] = useState({
    username: "",
    email: "",
    userProfile: "",
  });

  useEffect(() => {
    const username = sessionStorage.getItem("username");
    const email = sessionStorage.getItem("email");
    setState({ username, email });
  }, []);

  return (
    <Context.Provider value={{ state, setState }}>{children}</Context.Provider>
  );
};

export default AppProvider;
