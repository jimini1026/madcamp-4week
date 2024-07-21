"use client";

import { useContext } from "react";
import { Context } from "./appProvider";
import ClientNavigation from "./clientNavigation";
import GuestNavigation from "./guestNavigation";

const Navigation = () => {
  const { state } = useContext(Context);

  return state.username ? <ClientNavigation /> : <GuestNavigation />;
};

export default Navigation;
