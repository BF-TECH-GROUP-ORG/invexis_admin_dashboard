"use client";

import React, { useState } from "react";
import CategoriesTable, { mockCategories } from "../layouts/CategoriesTable";
import CategoriesAnalyticsCards from "../layouts/CategoriesAnalyticsCards";

const CategoriesListPage = () => {
  const [activeFilters, setActiveFilters] = useState({});

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
        categories={mockCategories}
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
