import React from "react";
import AddNewCategoryForm from "../forms/AddNewCategoryForm";
import AddCategoryPageHeader from "../layouts/AddCategoryPageHeader";

const AddNewCategoryPage = () => {
  return (
    <div className="p-6 md:p-8">
      <AddCategoryPageHeader />
      <AddNewCategoryForm />
    </div>
  );
};

export default AddNewCategoryPage;
