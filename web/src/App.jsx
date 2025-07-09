import React, { useState, useEffect } from "react";
import {
  Monitor,
  Smartphone,
  Wifi,
  WifiOff,
  ArrowLeft,
  Volume2,
  VolumeX,
  Lock,
  Folder,
  MessageCircle,
  Moon,
  Power,
  Clipboard,
  Camera,
  X,
  Plus,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Settings,
  Search,
  MoreVertical,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Home,
  Menu,
  Bell,
  Shield,
  Zap,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Edit3,
  Share2,
  Star,
  Heart,
  Bookmark,
  Cpu,
  HardDrive,
  Activity,
  Signal,
} from "lucide-react";
import axios from "axios";

function App() {
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [devices, setDevices] = useState([
    {
      id: "1",
      name: "MacBook Pro M4",
      type: "mac",
      status: "online",
      lastSeen: "Now",
    },
    {
      id: "2",
      name: "Asus TUF F15",
      type: "windows",
      status: "offline",
      lastSeen: "2 min ago",
    },
    {
      id: "3",
      name: "Ubuntu Server",
      type: "linux",
      status: "connecting",
      lastSeen: "5 min ago",
    },
  ]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [pairCode, setPairCode] = useState("");
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  

  const quickActions = [
    {
      id: "1",
      name: "Mute",
      icon: VolumeX,
      color: "blue",
      category: "media",
      value: "volume_mute",
    },
    {
      id: "2",
      name: "Unmute",
      icon: VolumeX,
      color: "blue",
      category: "media",
      value: "volume_unmute",
    },
    {
      id: "3",
      name: "Lock Screen",
      icon: Lock,
      color: "blue",
      category: "system",
      value: "lock",
    },
    {
      id: "4",
      name: "Sleep",
      icon: Moon,
      color: "blue",
      category: "system",
      value: "sleep",
    },
    {
      id: "5",
      name: "Screenshot",
      icon: Camera,
      color: "blue",
      category: "system",
      value: "screenshot", 
    },
    {
      id: "6",
      name: "Files",
      icon: Folder,
      color: "blue",
      category: "apps",
      value: "open_finder",
    },
    {
      id: "7",
      name: "Play/Pause",
      icon: Play,
      color: "blue",
      category: "media",
      value: null, // Not defined in commands
    },
    {
      id: "8",
      name: "Next Track",
      icon: SkipForward,
      color: "blue",
      category: "media",
      value: null, // Not defined in commands
    },
    {
      id: "9",
      name: "Clipboard",
      icon: Clipboard,
      color: "blue",
      category: "system",
      value: "clipboard_hello",
    },
    {
      id: "10",
      name: "Notification",
      icon: Bell,
      color: "blue",
      category: "system",
      value: "notify",
    },
    {
      id: "11",
      name: "Shutdown",
      icon: Power,
      color: "blue",
      category: "system",
      value: "shutdown",
    },
    {
      id: "12",
      name: "Refresh",
      icon: RefreshCw,
      color: "blue",
      category: "system",
      value: null, // Not defined in commands
    },
  ];

  useEffect(() => {
    if (currentScreen === "devices") {
      setPairCode(Math.random().toString(36).substring(2, 8).toUpperCase());
    }
  }, [currentScreen]);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = (email, password) => {
    const name = email.split("@")[0];
    console.log(password)
    setUser({ email, name: name.charAt(0).toUpperCase() + name.slice(1) });
    setCurrentScreen("dashboard");
    showNotification("Welcome to Deskly!", "success");
  };

  const handleControlDevice = (device) => {
    if (device.status !== "online") {
      showNotification("Device is not available", "error");
      return;
    }
    setSelectedDevice(device);
    setCurrentScreen("control");
  };

  const handleCommand = async (action) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/command",
        {
          cmd: action.value,
        },
        {
          headers: {
            Authorization: "amd123",
          },
        }
      );

      if (response?.status === 200) {
        console.log(response.data);
        showNotification(
          `${action.name} executed on ${selectedDevice?.name}`,
          "success"
        );
      } else {
        showNotification(`Failed to execute ${action.name}`, "error");
      }
    } catch (err) {
      console.error("❌ Command execution error:", err);
      showNotification(`Failed to execute ${action.name}`, "error");
    }
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case "mac":
        return Monitor;
      case "windows":
        return Monitor;
      case "linux":
        return Monitor;
      default:
        return Smartphone;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-emerald-500";
      case "offline":
        return "bg-slate-400";
      case "connecting":
        return "bg-amber-500";
      default:
        return "bg-slate-400";
    }
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case "high":
        return "text-emerald-600 bg-emerald-50";
      case "medium":
        return "text-amber-600 bg-amber-50";
      case "low":
        return "text-red-600 bg-red-50";
      default:
        return "text-slate-600 bg-slate-50";
    }
  };

  const filteredActions = quickActions.filter((action) => {
    const matchesSearch = action.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || action.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const renderLoginScreen = () => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center flex flex-col items-center gap-4 mb-8">
            <div className="w-19 h-19 aspect-square">
              <img className="w-full h-full aspect-square" src="/CmdCast-logo.png" />
            </div>
           <div>
             <h1 className="text-3xl font-bold mb-2">CmdCast</h1>
            <p>Remote desktop control</p>
           </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleLogin(formData.get("email"), formData.get("password"));
            }}
            className="space-y-6"
          >
            <div>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-4 bg-white/10 border border-gray-200 rounded-2xl placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-sm"
                placeholder="Email address"
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                required
                className="w-full px-4 py-4 bg-white/10 border border-gray-200 rounded-2xl placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-sm"
                placeholder="Password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#2f4858] text-white font-semibold py-4 px-6 rounded-2xl transition-all transform hover:scale-[1.02] shadow-xl"
            >
              Sign In
            </button>

            <div className="text-center">
              <button type="button" className="transition-colors text-sm">
                Don't have an account?{" "}
                <span className="text-blue-500 hover:text-blue-600 cursor-pointer">
                  Sign up
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
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
              onClick={() => setCurrentScreen("settings")}
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
                onClick={() => setCurrentScreen("devices")}
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
                      onClick={() => handleControlDevice(device)}
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

  const renderDevicesScreen = () => (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-100">
        <div className="py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setCurrentScreen("dashboard")}
                className="p-2 cursor-pointer"
              >
                <ArrowLeft className="w-6 h-6 text-slate-600" />
              </button>
              <h1 className="text-2xl font-bold text-slate-900">Devices</h1>
            </div>
            <button
              onClick={() =>
                setPairCode(
                  Math.random().toString(36).substring(2, 8).toUpperCase()
                )
              }
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
              onClick={() =>
                setPairCode(
                  Math.random().toString(36).substring(2, 8).toUpperCase()
                )
              }
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
                        onClick={() => handleControlDevice(device)}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 cursor-pointer text-white text-sm font-medium rounded-xl transition-colors"
                      >
                        Control
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          showNotification("Attempting to reconnect...", "info")
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

  const renderControlScreen = () => (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-100">
        <div className="py-5">
          <div className="flex justify-betwee items-center">
            <div className="flex items-center">
              <button
                onClick={() => setCurrentScreen("dashboard")}
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
                    onClick={() => handleCommand(action)}
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
    </div>
  );

  const renderSettingsScreen = () => (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-100">
        <div className="py-5">
          <div className="flex items-center">
            <button
              onClick={() => setCurrentScreen("dashboard")}
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
          {[
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
          ].map((item, index) => (
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
            onClick={() => {
              setUser(null);
              setCurrentScreen("login");
              showNotification("Signed out successfully", "info");
            }}
            className="w-full p-5 flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 transition-colors rounded-2xl"
          >
            <Power className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {currentScreen === "login" && renderLoginScreen()}
      {currentScreen === "dashboard" && renderDashboard()}
      {currentScreen === "devices" && renderDevicesScreen()}
      {currentScreen === "control" && renderControlScreen()}
      {currentScreen === "settings" && renderSettingsScreen()}

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
                <Monitor className="w-16 h-16 text-slate-400 mx-auto mb-4" />
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

      {/* Notifications */}
      {notification && (
        <div className="fixed top-6 left-6 right-6 z-50">
          <div
            className={`flex items-center p-4 rounded-2xl shadow-lg backdrop-blur-sm ${
              notification.type === "success"
                ? "bg-emerald-100/90 text-emerald-800"
                : notification.type === "error"
                ? "bg-red-100/90 text-red-800"
                : "bg-blue-100/90 text-blue-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5 mr-3" />
            ) : notification.type === "error" ? (
              <AlertCircle className="w-5 h-5 mr-3" />
            ) : (
              <Bell className="w-5 h-5 mr-3" />
            )}
            <span className="font-medium flex-1">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
