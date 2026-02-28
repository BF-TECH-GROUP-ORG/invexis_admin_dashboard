import apiClient from "@/lib/apiClient";

const CompanyService = {
  // Core CRUD
  getAll: async (params = {}) => {
    return apiClient.get("/company/companies", { params });
  },

  getById: async (id) => {
    return apiClient.get(`/company/companies/${id}`);
  },

  create: async (data) => {
    return apiClient.post("/company/companies", data);
  },

  update: async (id, data) => {
    return apiClient.put(`/company/companies/${id}`, data);
  },

  delete: async (id) => {
    return apiClient.delete(`/company/companies/${id}`);
  },

  // Status & Tier
  changeStatus: async (id, status) => {
    return apiClient.patch(`/company/companies/${id}/status`, { status });
  },

  changeTier: async (id, tier) => {
    return apiClient.patch(`/company/companies/${id}/tier`, { tier });
  },

  reactivate: async (id) => {
    return apiClient.patch(`/company/companies/${id}/reactivate`);
  },

  // Verification
  uploadVerificationDocs: async (id, formData) => {
    try {
      // Use relative URL to leverage Next.js proxy
      const Base = process.env.NEXT_PUBLIC_API_URL;
      const url = `${Base}/company/companies/${id}/verification-docs`;

      // Get the session to retrieve the access token
      const session = await (await import("next-auth/react")).getSession();
      const accessToken = session?.accessToken;

      if (process.env.NODE_ENV === "development") {
        const count = formData.getAll("files").length;
        console.log(`[CompanyService] Prompting upload to ${url} with ${count} files. Token size: ${accessToken?.length || 0}`);
      }

      if (!accessToken && process.env.NODE_ENV === "development") {
        console.warn("[CompanyService] No access token found in session!");
      }

      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "ngrok-skip-browser-warning": "true",
          // Let browser set Content-Type for FormData
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to upload documents");
      }
      return data;
    } catch (error) {
      console.error("[CompanyService] Fetch upload failed:", error);
      throw error;
    }
  },

  reviewVerification: async (id, decision, reviewNotes = "") => {
    return apiClient.patch(`/company/companies/${id}/verification`, {
      decision,
      reviewNotes,
    });
  },

  // Categories
  addCategories: async (id, categoryIds) => {
    return apiClient.post(`/company/companies/${id}/categories`, {
      categoryIds,
    });
  },

  setCategories: async (id, categoryIds) => {
    return apiClient.put(`/company/companies/${id}/categories`, {
      categoryIds,
    });
  },

  removeCategories: async (id, categoryIds) => {
    return apiClient.delete(`/company/companies/${id}/categories`, {
      data: { categoryIds },
    });
  },
};

export default CompanyService;
