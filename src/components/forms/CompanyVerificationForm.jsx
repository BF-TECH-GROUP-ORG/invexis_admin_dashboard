"use client";

import React, { useState } from "react";
import CompanyService from "@/services/CompanyService";
import { useNotification } from "@/providers/NotificationProvider";
import { useLoading } from "@/providers/LoadingProvider";

export default function CompanyVerificationForm({
  companyId,
  existingDocs = [],
  onUploaded,
}) {
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const { showNotification } = useNotification();
  const { showLoader, hideLoader } = useLoading();

  const handleFiles = (fileList) => {
    const arr = Array.from(fileList || []);
    setFiles((prev) => [...prev, ...arr]);
    const urls = arr.map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
      file: f,
    }));
    setPreviewUrls((p) => [...p, ...urls]);
  };

  const removePreview = (idx) => {
    setPreviewUrls((p) => p.filter((_, i) => i !== idx));
    setFiles((f) => f.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.length)
      return showNotification({
        message: "Pick at least one file to upload",
        severity: "info",
      });

    try {
      showLoader();
      const fd = new FormData();
      files.forEach((f) => fd.append("documents", f));
      const res = await CompanyService.uploadVerificationDocs(companyId, fd);
      if (res?.success) {
        showNotification({
          message: "Documents uploaded",
          severity: "success",
        });
        setFiles([]);
        setPreviewUrls([]);
        onUploaded?.();
      } else {
        showNotification({ message: "Upload failed", severity: "error" });
      }
    } catch (err) {
      console.error(err);
      showNotification({
        message: err?.response?.data?.message || "Upload failed",
        severity: "error",
      });
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold mb-3">Verify Company</h3>

      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-2">
          Upload legal documents (IDs, certificates, licenses)
        </label>
        <input
          type="file"
          onChange={(e) => handleFiles(e.target.files)}
          multiple
          className="block w-full text-sm text-gray-700"
        />
      </div>

      <div className="mb-4">
        <div className="flex gap-3 flex-wrap">
          {previewUrls.map((p, i) => (
            <div
              key={i}
              className="w-28 h-20 border rounded p-1 bg-gray-50 relative"
            >
              {p.url && p.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img
                  src={p.url}
                  alt={p.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-gray-600">
                  {p.name}
                </div>
              )}
              <button
                onClick={() => removePreview(i)}
                className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white text-xs w-5 h-5"
              >
                ×
              </button>
            </div>
          ))}

          {/* show existing docs */}
          {(existingDocs || []).map((d, i) => (
            <a
              key={`exist-${i}`}
              href={d.url}
              target="_blank"
              rel="noreferrer"
              className="w-28 h-20 border rounded p-2 bg-white flex items-center justify-center text-xs text-gray-700"
            >
              {d.name || d.url}
            </a>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded-xl bg-[#ff782d] text-white font-semibold"
        >
          Upload
        </button>
      </div>
    </div>
  );
}
