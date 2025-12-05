"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { restoreSession } from "@/features/AuthSlice";
import { useLoading } from "@/providers/LoadingProvider";

export default function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { isInitialized, status } = useSelector((state) => state.auth);
  const { showLoader, hideLoader } = useLoading();

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    if (status === "loading") {
      showLoader();
    } else {
      hideLoader();
    }
  }, [status, showLoader, hideLoader]);

  if (!isInitialized) {
    return null; // Or a dedicated loading screen
  }

  return children;
}
