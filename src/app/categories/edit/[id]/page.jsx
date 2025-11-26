"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import EditCategoryForm from "../../../../components/forms/EditCategoryForm";
import CategoryService from "../../../../services/CategoryService";
import { useLoading } from "../../../../providers/LoadingProvider";
import { useNotification } from "../../../../providers/NotificationProvider";

const EditCategoryPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { showLoader, hideLoader } = useLoading();
  const { showNotification } = useNotification();
  const [category, setCategory] = useState(null);

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      showLoader();
      const data = await CategoryService.getById(id);
      setCategory(data?.data || data);
    } catch (err) {
      console.error("Failed to fetch category", err);
      showNotification({ message: "Failed to load category", severity: "error" });
      router.push("/categories/list");
    } finally {
      hideLoader();
    }
  };

  if (!category) return null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <EditCategoryForm initialData={category} />
    </div>
  );
};

export default EditCategoryPage;
