"use client";

import React, { useState, useEffect } from "react";
import CategoriesTable from "../layouts/CategoriesTable";
import CategoriesAnalyticsCards from "../layouts/CategoriesAnalyticsCards";
import CategoryService from "../../services/CategoryService";
import { useLoading } from "../../providers/LoadingProvider";
import { useNotification } from "../../providers/NotificationProvider";

const CategoriesListPage = () => {
  const [activeFilters, setActiveFilters] = useState({});
  const [categories, setCategories] = useState([]);
  const { showLoader, hideLoader } = useLoading();
  const { showNotification } = useNotification();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        showLoader();
        const data = await CategoryService.getAll({ page: 1, limit: 1000 });
        const cats = data?.data || data || [];
        if (mounted) setCategories(cats);
      } catch (err) {
        console.error("Failed to fetch categories for analytics", err);
        showNotification({
          message: "Failed to load category stats",
          severity: "error",
        });
      } finally {
        hideLoader();
      }
    })();
    return () => (mounted = false);
  }, []);

  const handleCardFilter = (payload) => {
    // payload: { level, emptyOnly }
    setActiveFilters(payload || {});
  };

  const handleTableFilterChange = (payload) => {
    setActiveFilters(payload || {});
  };

  return (
    <div className="p-6 md:p-8">
      <CategoriesAnalyticsCards
        categories={categories}
        onFilter={handleCardFilter}
        activeFilters={activeFilters}
      />
      <CategoriesTable
        filterLevel={activeFilters.level}
        filterParent={activeFilters.parent}
        onFilterChange={handleTableFilterChange}
      />
    </div>
  );
};

export default CategoriesListPage;
