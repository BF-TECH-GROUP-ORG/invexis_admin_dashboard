import React from "react";
import AddNewCompanyForm from "../forms/AddNewCompanyForm";
import AddCompanyPageHeader from "../layouts/AddCompanyPageHeader";

const AddNewCompanyPage = () => {
  return (
    <div className="p-6 md:p-8">
      <AddCompanyPageHeader />
      <AddNewCompanyForm />
    </div>
  );
};

export default AddNewCompanyPage;
