import React from "react";

interface ConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

const Confirmation: React.FC<ConfirmationProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm", 
  message = "Are you sure?" 
}) => {
  if (!isOpen) return null;

return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0f172a]/70 backdrop-blur-sm z-50">
      <div className="bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#1e293b] border border-red-500 text-red-200 p-6 rounded-xl shadow-[0_0_20px_rgba(255,0,0,0.2)] w-96 transition-all duration-300">
        <h2 className="text-xl font-bold tracking-wide text-red-400">{title}</h2>
        <p className="text-sm my-3 text-red-100">{message}</p>
        <div className="flex items-center justify-end space-x-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-red-200 bg-gray-700 hover:bg-gray-600 border border-red-400 rounded-lg transition hover:shadow-[0_0_10px_rgba(255,0,0,0.3)]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-600 hover:bg-red-500 border border-red-300 rounded-lg transition shadow-md hover:shadow-[0_0_15px_rgba(255,0,0,0.4)]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
