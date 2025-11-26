"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import CompanyService from "@/services/CompanyService";
import { useNotification } from "@/providers/NotificationProvider";
import { useLoading } from "@/providers/LoadingProvider";
import CompanyVerificationForm from "@/components/forms/CompanyVerificationForm";

export default function CompanyVerifyPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showLoader, hideLoader } = useLoading();
  const { showNotification } = useNotification();
  const [company, setCompany] = React.useState(null);

  const fetchCompany = async () => {
    try {
      showLoader();
      const res = await CompanyService.getById(id);
      setCompany(res?.data || res);
    } catch (err) {
      console.error(err);
      showNotification({
        message: "Failed to load company",
        severity: "error",
      });
      router.push("/clients/list");
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    if (id) fetchCompany();
  }, [id]);

  const onUploaded = () => fetchCompany();

  const handleReview = async (decision) => {
    try {
      showLoader();
      await CompanyService.reviewVerification(
        id,
        decision,
        `${decision} by admin`
      );
      showNotification({
        message: `Verification ${decision}`,
        severity: "success",
      });
      fetchCompany();
    } catch (err) {
      console.error(err);
      showNotification({
        message: "Failed to review verification",
        severity: "error",
      });
    } finally {
      hideLoader();
    }
  };

  if (!company) return null;

  return (
    <div className="min-h-screen p-6 md:p-12 bg-gray-50 flex items-start justify-center">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/clients/list")}
            className="flex items-center gap-2 text-gray-600 hover:text-[#ff782d]"
          >
            ← Back to Companies
          </button>
          <h1 className="text-2xl font-bold">Verify {company.name}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Company Details</h3>
            <p className="text-sm text-gray-600 mb-2">
              Name: <span className="font-medium">{company.name}</span>
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Email:{" "}
              <span className="font-medium">{company.email || "N/A"}</span>
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Phone:{" "}
              <span className="font-medium">{company.phone || "N/A"}</span>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Status:{" "}
              <span className="font-semibold capitalize">
                {company.status?.replace("_", " ")}
              </span>
            </p>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Uploaded Documents</h4>
              {(company.metadata?.verification?.documents || []).length ===
                0 && (
                <p className="text-xs text-gray-500">
                  No documents uploaded yet.
                </p>
              )}
              <div className="flex flex-col gap-2 mt-2">
                {(company.metadata?.verification?.documents || []).map(
                  (d, i) => (
                    <a
                      key={i}
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm p-2 rounded border hover:bg-gray-50"
                    >
                      {d.name || d.url}
                    </a>
                  )
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => handleReview("approved")}
                className="px-3 py-2 rounded bg-green-600 text-white"
              >
                Approve
              </button>
              <button
                onClick={() => handleReview("rejected")}
                className="px-3 py-2 rounded bg-red-500 text-white"
              >
                Reject
              </button>
            </div>
          </div>

          <div>
            <CompanyVerificationForm
              companyId={id}
              existingDocs={company.metadata?.verification?.documents || []}
              onUploaded={onUploaded}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
