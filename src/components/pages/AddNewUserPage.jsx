import React from "react";
import AddNewUserForm from "../forms/AddNewUserForm";
import AddUserPageHeader from "../layouts/AddUserPageHeader";

const AddNewUserPage = () => {
  return (
    <div className="p-6 md:p-8">
      <AddUserPageHeader />
      <AddNewUserForm />
    </div>
  );
};

export default AddNewUserPage;
