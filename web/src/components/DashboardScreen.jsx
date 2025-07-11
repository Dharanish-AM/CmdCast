import React from "react";
import { Settings, Zap, Monitor } from "lucide-react";

const DashboardScreen = ({ 
  user, 
  devices, 
  onNavigate, 
  onControlDevice, 
  getDeviceIcon, 
  getStatusColor 
}) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-100">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-sm text-slate-500 mt-1">
                Welcome back, {user?.name}
              </p>
            </div>
            <button
              onClick={() => onNavigate("settings")}
              className="p-3 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Settings className="w-6 h-6 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 pb-24">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Active</p>
                <p className="text-2xl font-bold text-slate-900">
                  {devices.filter((d) => d.status === "online").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Monitor className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total</p>
                <p className="text-2xl font-bold text-slate-900">
                  {devices.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Devices */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Devices
              </h2>
              <button
                onClick={() => onNavigate("devices")}
                className="text-primary text-sm font-medium"
              >
                View all
              </button>
            </div>
          </div>
          <div className="p-5 space-y-4">
            {devices.slice(0, 3).map((device) => {
              const DeviceIcon = getDeviceIcon(device.type);
              return (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <DeviceIcon className="w-8 h-8 text-slate-600" />
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(
                          device.status
                        )} rounded-full border-2 border-white`}
                      ></div>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {device.name}
                      </p>
                      <div className="flex items-center space-x-3 mt-1">
                        <p className="text-sm text-slate-500">
                          {device.lastSeen}
                        </p>
                      </div>
                    </div>
                  </div>
                  {device.status === "online" && (
                    <button
                      onClick={() => onControlDevice(device)}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 cursor-pointer text-white text-sm font-medium rounded-xl transition-colors"
                    >
                      Control
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
