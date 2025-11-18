import React from "react";
import BulkImportForm from "../forms/BulkImportForm";
import BulkImportPageHeader from "../layouts/BulkImportPageHeader";

const BulkImportPage = () => {
  return (
    <div className="p-6 md:p-8">
      <BulkImportPageHeader />
      <BulkImportForm />
    </div>
  );
};

export default BulkImportPage;
