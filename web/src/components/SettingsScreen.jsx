import React from "react";
import { 
  ArrowLeft, 
  Edit3, 
  Bell, 
  Shield, 
  Wifi, 
  Eye, 
  Download, 
  Share2, 
  Power 
} from "lucide-react";

const SettingsScreen = ({ user, onNavigate, onSignOut }) => {
  const settingsOptions = [
    {
      icon: Bell,
      title: "Notifications",
      subtitle: "Manage alerts and sounds",
      color: "blue",
    },
    {
      icon: Shield,
      title: "Security",
      subtitle: "Privacy and security settings",
      color: "blue",
    },
    {
      icon: Wifi,
      title: "Connection",
      subtitle: "Network and pairing options",
      color: "blue",
    },
    {
      icon: Eye,
      title: "Appearance",
      subtitle: "Theme and display settings",
      color: "blue",
    },
    {
      icon: Download,
      title: "Backup",
      subtitle: "Data backup and restore",
      color: "blue",
    },
    {
      icon: Share2,
      title: "Share",
      subtitle: "Invite friends to Deskly",
      color: "blue",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-100">
        <div className="py-5">
          <div className="flex items-center">
            <button
              onClick={() => onNavigate("dashboard")}
              className="p-2 cursor-pointer"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile */}
        <div className="bg-white rounded-2xl shadow-sm relative border border-slate-100">
          <div className="p-5">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 aspect-square bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {user?.name?.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">
                  {user?.name}
                </h3>
                <p className="text-slate-500">{user?.email}</p>
              </div>
              <button className="p-2 hover:bg-slate-100 absolute top-0 right-0 rounded-xl transition-colors">
                <Edit3 className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Settings Options */}
        <div className="space-y-3">
          {settingsOptions.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-slate-100"
            >
              <button className="w-full p-5 flex items-center space-x-4 hover:bg-slate-50 transition-colors rounded-2xl">
                <div className={`p-3 rounded-xl`}>
                  <item.icon className={`w-5 h-5`} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{item.subtitle}</p>
                </div>
                <ArrowLeft className="w-5 h-5 text-slate-400 rotate-180" />
              </button>
            </div>
          ))}
        </div>

        {/* Sign Out */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <button
            onClick={onSignOut}
            className="w-full p-5 flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 transition-colors rounded-2xl"
          >
            <Power className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
