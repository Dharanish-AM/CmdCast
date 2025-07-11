import React from "react";
import { CheckCircle, AlertCircle, Bell } from "lucide-react";

const Notification = ({ notification }) => {
  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 mr-3" />;
      case "error":
        return <AlertCircle className="w-5 h-5 mr-3" />;
      default:
        return <Bell className="w-5 h-5 mr-3" />;
    }
  };

  const getStyles = () => {
    switch (notification.type) {
      case "success":
        return "bg-emerald-100/90 text-emerald-800";
      case "error":
        return "bg-red-100/90 text-red-800";
      default:
        return "bg-blue-100/90 text-blue-800";
    }
  };

  return (
    <div className="fixed top-6 left-6 right-6 z-50">
      <div
        className={`flex items-center p-4 rounded-2xl shadow-lg backdrop-blur-sm ${getStyles()}`}
      >
        {getIcon()}
        <span className="font-medium flex-1">{notification.message}</span>
      </div>
    </div>
  );
};

export default Notification;
