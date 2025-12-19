"use client"
import React from "react";
import AddNewCompanyForm from "../forms/AddNewCompanyForm";
import AddCompanyPageHeader from "../layouts/AddCompanyPageHeader";
import { useSession } from "next-auth/react";


const AddNewCompanyPage = () => {
  const {data: session} = useSession();
  console.log('this is token '+session?.accessToken);  
  return (
    <div className="p-6 md:p-8">
      <AddCompanyPageHeader />
      <AddNewCompanyForm />
    </div>
  );
};

export default AddNewCompanyPage;
