import React from "react";
import { ArrowLeft, Search, Maximize2, Camera, Activity, X } from "lucide-react";

const ControlScreen = ({ 
  selectedDevice, 
  searchQuery, 
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  filteredActions,
  showScreenshot,
  setShowScreenshot,
  onNavigate,
  onHandleCommand,
  getDeviceIcon,
  getStatusColor 
}) => {
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-100">
        <div className="py-5">
          <div className="flex justify-betwee items-center">
            <div className="flex items-center">
              <button
                onClick={() => onNavigate("dashboard")}
                className="p-2 cursor-pointer"
              >
                <ArrowLeft className="w-6 h-6 text-slate-600" />
              </button>
              <h1 className="text-2xl font-bold text-slate-900">Control</h1>
            </div>
            <div className="flex items-center pr-4 justify-end space-x-3 flex-1">
              {selectedDevice && (
                <>
                  {React.createElement(getDeviceIcon(selectedDevice.type), {
                    className: "w-8 h-8 text-slate-600",
                  })}
                  <div>
                    <h1 className="text-lg font-semibold text-slate-900">
                      {selectedDevice.name}
                    </h1>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 ${getStatusColor(
                          selectedDevice.status
                        )} rounded-full`}
                      ></div>
                      <span className="text-sm text-slate-500 capitalize font-medium">
                        {selectedDevice.status}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl transition-all shadow-sm"
            />
          </div>

          <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
            {["all", "system", "media", "apps", "custom"].map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  activeCategory === category
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Live Preview
              </h2>
              <button
                onClick={() => setShowScreenshot(true)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Maximize2 className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
          <div className="p-5">
            <div
              className="bg-slate-100 rounded-xl aspect-video flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
              onClick={() => setShowScreenshot(true)}
            >
              <div className="text-center">
                <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 text-sm font-medium">
                  Tap to view fullscreen
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Live desktop preview
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-slate-500">Last updated: Now</p>
              <div className="flex items-center space-x-1">
                <Activity className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">
                  Live
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">
              Quick Actions
            </h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 gap-4">
              {filteredActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => onHandleCommand(action)}
                    className="flex flex-col items-center p-4 hover:bg-slate-50 rounded-2xl transition-colors"
                  >
                    <div
                      className={`p-3 bg-${action.color}-100 rounded-2xl mb-3`}
                    >
                      <Icon className={`w-6 h-6 text-${action.color}-600`} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 text-center">
                      {action.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Screenshot Modal */}
      {showScreenshot && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-6">
          <div className="max-w-4xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white text-lg font-semibold">
                Live View - {selectedDevice?.name}
              </h3>
              <button
                onClick={() => setShowScreenshot(false)}
                className="text-white hover:text-slate-300 transition-colors p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="bg-slate-800 rounded-2xl aspect-video flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 font-medium">
                  Live screenshot feed
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Real-time desktop preview
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlScreen;
