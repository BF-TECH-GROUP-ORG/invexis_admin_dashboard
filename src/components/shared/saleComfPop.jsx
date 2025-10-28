import { Button } from "./button";
const SaleNotificationModal = ({ isOpen, onClose, type, message }) => {
  if (!isOpen) return null;

  const isSuccess = type === "success";
  const bgColor = isSuccess ? "bg-green-500" : "bg-red-500";
  const icon = isSuccess ? (
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
  ) : (
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center   bg-opacity-70 backdrop-blur-sm  transition-all duration-75">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-100">
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-3 rounded-full ${bgColor}`}>
            {icon}
          </div>
          <h3 className={`text-xl font-bold ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
            {isSuccess ? "Success!" : "Error!"}
          </h3>
          <p className="text-center text-gray-600 text-sm">
            {message}
          </p>
          <Button
            onClick={onClose}
            className={`w-full ${isSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white mt-3`}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SaleNotificationModal