"use client";

import React from "react";
import { Provider } from "react-redux";
import store from "@/store";

import AuthProvider from "./AuthProvider";

const ClientProviders = ({ children }) => {
  return (
    <Provider store={store}>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  );
};

export default ClientProviders;
