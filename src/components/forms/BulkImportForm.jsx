"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";

const BulkImportForm = () => {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState(null);

  // Supported file formats
  const supportedFormats = [".xlsx", ".xls", ".csv", ".ods"];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    setError("");
    setSuccess(false);

    if (!selectedFile) {
      setFile(null);
      setFileName("");
      setPreview(null);
      return;
    }

    // Validate file type
    const fileExtension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (!supportedFormats.includes(fileExtension)) {
      setError(
        `Invalid file format. Supported formats: ${supportedFormats.join(", ")}`
      );
      setFile(null);
      setFileName("");
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      setFile(null);
      setFileName("");
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setPreview({
      name: selectedFile.name,
      size: (selectedFile.size / 1024).toFixed(2),
      type: fileExtension,
      lastModified: new Date(selectedFile.lastModified).toLocaleDateString(),
    });
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileName("");
    setPreview(null);
    setError("");
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setUploading(true);

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append("file", file);

      // Call your API endpoint
      const response = await fetch("/api/companies/bulk-import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to import companies");
      }

      // Show success message
      setSuccess(true);
      setFile(null);
      setFileName("");
      setPreview(null);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/clients/list");
      }, 2000);
    } catch (err) {
      setError(err.message || "An error occurred during upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        {/* Form Container */}
        <div className="border-2 border-[#d1d5db] rounded-3xl p-8 md:p-12 bg-white">
          {/* Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#081422]">
              Bulk Import Companies
            </h2>
            <p className="text-[#6b7280] mt-2">
              Upload an Excel file to import multiple companies at once
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-300 flex items-start gap-3">
              <AlertCircle
                size={20}
                className="text-red-500 flex-shrink-0 mt-1"
              />
              <div>
                <p className="font-semibold text-red-700">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 rounded-2xl bg-green-50 border-2 border-green-300 flex items-start gap-3">
              <CheckCircle
                size={20}
                className="text-green-500 flex-shrink-0 mt-1"
              />
              <div>
                <p className="font-semibold text-green-700">Success</p>
                <p className="text-green-600 text-sm mt-1">
                  Companies imported successfully! Redirecting to companies
                  list...
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* File Upload Section */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-[#081422] mb-4">
                Select Excel File
              </label>

              {!preview ? (
                <div className="border-2 border-dashed border-[#d1d5db] rounded-2xl p-8 text-center hover:border-[#ff782d] hover:bg-[#fff8f5] transition-all cursor-pointer">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.ods"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload size={40} className="text-[#ff782d] mb-3" />
                    <p className="text-lg font-semibold text-[#081422] mb-1">
                      Drop file or click to upload
                    </p>
                    <p className="text-sm text-[#6b7280] mb-3">
                      Supported formats: Excel (.xlsx, .xls), CSV, ODS
                    </p>
                    <p className="text-xs text-[#9ca3af]">
                      Maximum file size: 10MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="border-2 border-[#d1d5db] rounded-2xl p-6 bg-[#f9fafb]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-[#ff782d]/10 flex items-center justify-center flex-shrink-0">
                        <Upload size={24} className="text-[#ff782d]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#081422]">
                          {preview.name}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs text-[#6b7280]">
                          <span>{preview.type}</span>
                          <span>{preview.size} KB</span>
                          <span>{preview.lastModified}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <X size={20} className="text-[#6b7280]" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Information Box */}
            <div className="mb-8 p-4 rounded-2xl bg-[#f0f9ff] border-2 border-[#e0f2fe]">
              <p className="text-sm text-[#0369a1] font-semibold mb-2">
                📋 Excel Format Requirements
              </p>
              <ul className="text-xs text-[#0369a1] space-y-1 ml-4 list-disc">
                <li>Headers in the first row</li>
                <li>
                  Required columns: name, domain, email, phone, country, city,
                  address
                </li>
                <li>
                  Optional columns: industry, employees, registrationNumber,
                  tier
                </li>
                <li>Ensure email addresses are valid</li>
                <li>Phone numbers should start with + and country code</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={uploading}
                className={`flex-1 px-6 py-3 rounded-2xl font-semibold border-2 transition-all ${
                  uploading
                    ? "border-[#d1d5db] text-[#d1d5db] cursor-not-allowed"
                    : "border-[#d1d5db] text-[#081422] hover:border-[#ff782d] hover:text-[#ff782d]"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file || uploading}
                className={`flex-1 px-6 py-3 rounded-2xl font-semibold text-white transition-all ${
                  !file || uploading
                    ? "bg-[#cccccc] cursor-not-allowed"
                    : "bg-[#ff782d] hover:bg-[#ff6b1a]"
                }`}
              >
                {uploading ? "Uploading..." : "Import Companies"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BulkImportForm;
