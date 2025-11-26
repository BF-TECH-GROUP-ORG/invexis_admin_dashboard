"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { restoreSession } from "@/features/AuthSlice";

export default function AuthProvider({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  return children;
}
