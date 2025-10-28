"use client";
import { useState, useCallback } from "react";
import { Button } from "../shared/button";
import SaleNotificationModal from "../shared/saleComfPop";
import jsPDF from "jspdf";

const SellProductsInputs = () => {
const navigateBack = () => console.log("Simulating navigation back...");

// States for Inputs
const [soldPrice, setSoldPrice] = useState("");
const [quantitySold, setQuantitySold] = useState("");
const [customerName, setCustomerName] = useState("");
const [customerPhone, setCustomerPhone] = useState("");
const [printReceipt, setPrintReceipt] = useState(false);

// States for Modal
const [isModalOpen, setIsModalOpen] = useState(false);
const [modalType, setModalType] = useState("");
const [modalMessage, setModalMessage] = useState("");
git 
// Validation errors
const [errors, setErrors] = useState({});

const closeModal = useCallback(() => {
setIsModalOpen(false);
setModalMessage("");
}, []);

const showModal = (type, message) => {
setModalType(type);
setModalMessage(message);
setIsModalOpen(true);
};

// Validation rules
const validateField = (name, value) => {
let errorMsg = "";


switch (name) {
  case "soldPrice":
    const price = parseFloat(value);
    if (!value) errorMsg = "Sold price is required.";
    else if (isNaN(price) || price <= 0)
      errorMsg = "Sold price must be a positive number.";
    break;

  case "quantitySold":
    const quantity = parseInt(value, 10);
    if (!value) errorMsg = "Quantity sold is required.";
    else if (isNaN(quantity) || quantity <= 0)
      errorMsg = "Quantity must be a positive whole number.";
    break;

  case "customerName":
    if (!value.trim()) errorMsg = "Customer name is required.";
    else if (value.trim().length < 3)
      errorMsg = "Name must be at least 3 characters.";
    break;

  case "customerPhone":
    if (!value.trim()) errorMsg = "Phone number is required.";
    else if (!/^[0-9]{10,15}$/.test(value.trim()))
      errorMsg = "Phone number must be between 10 and 15 digits.";
    break;

  default:
    break;
}

setErrors((prev) => ({ ...prev, [name]: errorMsg }));
return errorMsg;


};

const handleSubmit = async () => {
let formValid = true;
let newErrors = {};


const fields = { soldPrice, quantitySold, customerName, customerPhone };
for (const [name, value] of Object.entries(fields)) {
  const error = validateField(name, value);
  if (error) {
    formValid = false;
    newErrors[name] = error;
  }
}

if (!soldPrice || !quantitySold || !customerName || !customerPhone) {
  formValid = false;
}

if (Object.values(newErrors).some((err) => err !== "")) {
  formValid = false;
}

setErrors(newErrors);

if (!formValid) {
  showModal(
    "error",
    "Please fill all required fields correctly before submitting the sale."
  );
  return;
}

const data = {
  soldPrice: parseFloat(soldPrice),
  quantitySold: parseInt(quantitySold, 10),
  customerName: customerName.trim(),
  customerPhone: customerPhone.trim(),
  printReceipt,
};

try {
  await new Promise((resolve) => setTimeout(resolve, 800));

  // ✅ Generate and print receipt if checkbox is checked
  if (printReceipt) {
    const doc = new jsPDF();
    const total = (data.soldPrice * data.quantitySold).toFixed(2);

    doc.setFontSize(18);
    doc.text("Sales Receipt", 20, 20);
    doc.setFontSize(12);
    doc.text("Date: " + new Date().toLocaleDateString(), 20, 30);
    doc.text("Customer: " + data.customerName, 20, 40);
    doc.text("Phone: " + data.customerPhone, 20, 50);
    doc.text("Product: Iphone 14 Pro Max", 20, 60);
    doc.text("Quantity: " + data.quantitySold, 20, 70);
    doc.text("Sold Price: $" + data.soldPrice.toFixed(2), 20, 80);
    doc.text("Total: $" + total, 20, 90);
    doc.text("Thank you for your purchase!", 20, 110);

    // Open PDF in a new tab and print automatically
    const pdfBlob = doc.output("bloburl");
    const newWindow = window.open(pdfBlob);
    if (newWindow) {
      newWindow.onload = function () {
        newWindow.print();
      };
    }
  }

  showModal(
    "success",
    "Sale recorded successfully! The transaction details have been logged."
  );

  setSoldPrice("");
  setQuantitySold("");
  setCustomerName("");
  setCustomerPhone("");
  setErrors({});
  setPrintReceipt(false);
} catch (err) {
  console.error("Submission Error:", err);
  showModal(
    "error",
    "An unexpected error occurred while recording the sale. Please check the console for details."
  );
}

};

const inputClass =
"w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-orange-400 focus:border-orange-400 transition duration-150";

return ( 
<div className=" flex items-center justify-center font-sans"> 
  <div className="space-y-6 p-8 "> 
    <div> 
      <h1 className="text-3xl font-extrabold text-gray-800">Stock-Out <span className="text-orange-500">Iphone 14 pro max</span> </h1> 
      <p className="text-gray-500 mt-1">cord a new product sale transaction. </p> </div>
    <div className="space-y-4">
      {/* Sold Price */}
      <div>
        <input
          type="number"
          placeholder="Sold Price (e.g., 99.99)"
          value={soldPrice}
          onChange={(e) => setSoldPrice(e.target.value)}
          onBlur={(e) => validateField("soldPrice", e.target.value)}
          className={inputClass}
        />
        {errors.soldPrice && (
          <p className="text-red-500 text-xs mt-1">{errors.soldPrice}</p>
        )}
      </div>

      {/* Quantity */}
      <div>
        <input
          type="number"
          placeholder="Quantity Sold"
          value={quantitySold}
          onChange={(e) => setQuantitySold(e.target.value)}
          onBlur={(e) => validateField("quantitySold", e.target.value)}
          className={inputClass}
        />
        {errors.quantitySold && (
          <p className="text-red-500 text-xs mt-1">
            {errors.quantitySold}
          </p>
        )}
      </div>

      <div className="h-px bg-gray-200 my-6"></div>

      {/* Customer Name */}
      <div>
        <input
          type="text"
          placeholder="Customer Full Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          onBlur={(e) => validateField("customerName", e.target.value)}
          className={inputClass}
        />
        {errors.customerName && (
          <p className="text-red-500 text-xs mt-1">
            {errors.customerName}
          </p>
        )}
      </div>

      {/* Customer Phone */}
      <div>
        <input
          type="tel"
          placeholder="Customer Phone Number (10-15 digits)"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          onBlur={(e) => validateField("customerPhone", e.target.value)}
          className={inputClass}
        />
        {errors.customerPhone && (
          <p className="text-red-500 text-xs mt-1">
            {errors.customerPhone}
          </p>
        )}
      </div>

      {/* Checkbox */}
      <div className="flex items-center space-x-3 pt-2">
        <input
          type="checkbox"
          id="mycheck"
          checked={printReceipt}
          onChange={(e) => setPrintReceipt(e.target.checked)}
          className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
        />
        <label
          htmlFor="mycheck"
          className="text-sm font-medium text-gray-600 cursor-pointer select-none"
        >
          Print receipt after sale
        </label>
      </div>

      {/* Buttons */}
      <div className="flex justify-between pt-6 space-x-4">
        <Button
          type="button"
          className="bg-gray-200 text-gray-700 hover:bg-gray-300 flex-1"
          onClick={navigateBack}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
        >
          Confirm Sale
        </Button>
      </div>
    </div>

    {/* Modal */}
    <SaleNotificationModal
      isOpen={isModalOpen}
      onClose={closeModal}
      type={modalType}
      message={modalMessage}
    />
  </div>
</div>
)}

export default SellProductsInputs

