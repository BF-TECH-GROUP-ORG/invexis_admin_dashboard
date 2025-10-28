"use client";

import { Button } from "@mui/material";

export default function TermsAndPrivacyPopup({ open, onAgree, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose} // clicking the background closes the popup
    >
      <div
        className="bg-white rounded-xl p-6 max-w-lg w-full shadow-lg"
        onClick={(e) => e.stopPropagation()} // prevents closing when clicking inside the popup
      >
        <h2 className="text-xl font-bold mb-4">Terms & Privacy Policy</h2>
        <p className="text-gray-700 mb-4 text-sm">
          Please review and accept our Terms & Conditions and Privacy Policy
          before proceeding.
        </p>
        <div className="flex justify-end gap-4">
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              textTransform: "none",
              backgroundColor: "#e5e7eb",
              color: "#081422",
              fontWeight: 500,
              ":hover": { backgroundColor: "#d1d5db" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onAgree}
            sx={{
              backgroundColor: "#ff782d",
              textTransform: "none",
              ":hover": { opacity: 0.9 },
            }}
          >
            Agree
          </Button>
        </div>
      </div>
    </div>
  );
}