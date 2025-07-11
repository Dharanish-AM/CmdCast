import React from "react";
import { ArrowLeft, Plus, RotateCcw, MoreVertical } from "lucide-react";

const DevicesScreen = ({ 
  devices, 
  pairCode, 
  onNavigate, 
  onGenerateCode, 
  onControlDevice,
  onShowNotification,
  getDeviceIcon,
  getStatusColor 
}) => {
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-100">
        <div className="py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => onNavigate("dashboard")}
                className="p-2 cursor-pointer"
              >
                <ArrowLeft className="w-6 h-6 text-slate-600" />
              </button>
              <h1 className="text-2xl font-bold text-slate-900">Devices</h1>
            </div>
            <button
              onClick={onGenerateCode}
              className="p-3 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Plus className="w-6 h-6 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Pairing Section */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
          <h2 className="text-lg font-semibold mb-2">Pair New Device</h2>
          <p className="text-blue-100 text-sm mb-4">
            Enter this code on your device
          </p>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 text-center">
            <div className="text-3xl font-mono font-bold tracking-wider mb-3">
              {pairCode}
            </div>
            <button
              onClick={onGenerateCode}
              className="text-sm text-blue-100 hover:text-white transition-colors font-medium"
            >
              Generate new code
            </button>
          </div>
        </div>

        {/* Device List */}
        <div className="space-y-4">
          {devices.map((device) => {
            const DeviceIcon = getDeviceIcon(device.type);
            return (
              <div
                key={device.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="relative">
                      <DeviceIcon className="w-10 h-10 text-slate-600" />
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(
                          device.status
                        )} rounded-full border-2 border-white`}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-slate-900">
                          {device.name}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className="text-sm text-slate-500 capitalize font-medium">
                          {device.status}
                        </p>
                        <p className="text-sm text-slate-500">
                          {device.lastSeen}
                        </p>
                        {device.battery && (
                          <div className="flex items-center space-x-1">
                            <div className="w-4 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${device.battery}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-slate-500">
                              {device.battery}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {device.status === "online" ? (
                      <button
                        onClick={() => onControlDevice(device)}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 cursor-pointer text-white text-sm font-medium rounded-xl transition-colors"
                      >
                        Control
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          onShowNotification("Attempting to reconnect...", "info")
                        }
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Retry
                      </button>
                    )}
                    <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                      <MoreVertical className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DevicesScreen;
