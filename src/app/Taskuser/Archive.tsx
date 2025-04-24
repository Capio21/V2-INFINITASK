import React from "react";

interface ArchiveProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

const Archive: React.FC<ArchiveProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Archive Activity", 
  message = "Are you sure you want to archive this activity?" 
}) => {
  if (!isOpen) return null;

 return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0f172a]/70 backdrop-blur-sm z-50">
      <div className="bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#1e293b] border border-cyan-500 shadow-[0_0_20px_rgba(0,255,255,0.2)] text-cyan-300 p-6 rounded-xl w-96 transition-all duration-300">
        <h2 className="text-xl font-bold tracking-wide text-cyan-400">{title}</h2>
        <p className="text-sm my-3 text-cyan-100">{message}</p>
        <div className="flex items-center justify-end space-x-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-cyan-300 bg-gray-700 hover:bg-gray-600 border border-cyan-600 rounded-lg transition hover:shadow-[0_0_10px_rgba(0,255,255,0.3)]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-cyan-600 hover:bg-cyan-500 border border-cyan-300 rounded-lg transition shadow-md hover:shadow-[0_0_15px_rgba(0,255,255,0.4)]"
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  );
};

export default Archive;
