import React, { useState, useEffect } from "react";
import axios from "axios";

// Pages
import Home from "./views/Home";
import Devices from "./views/Devices";
import Control from "./views/Control";
import Settings from "./views/Settings";

// Components
import Notification from "./components/Notification";

// Hooks
import { useNotification } from "../../shared/hooks/useNotification";

// Utils
import { getDeviceIcon, getStatusColor } from "../../shared/utils";

// Data
import { QUICK_ACTIONS } from "../../shared/data/index";
import { RingLoader } from "react-spinners";

const Dashboard = ({ user, devices,onSignOut }) => {
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [pairCode, setPairCode] = useState("");
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const { notification, showNotification } = useNotification();

  useEffect(() => {
    if (currentScreen === "devices") {
      setPairCode(Math.random().toString(36).substring(2, 8).toUpperCase());
    }
  }, [currentScreen]);

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
      const url = `${import.meta.env.VITE_API_URL}/api/users/send-command`;
      console.log(url);
      const response = await axios.post(url, {
        deviceId_id: selectedDevice._id,
        command: action.value,
        userId: user._id,
      });

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

  const handleGenerateCode = () => {
    setPairCode(Math.random().toString(36).substring(2, 8).toUpperCase());
  };

  const handleSignOut = () => {
    onSignOut();
    showNotification("Signed out successfully", "info");
  };

  const filteredActions = QUICK_ACTIONS.filter((action) => {
    const matchesSearch = action.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || action.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return (
          <Home
            user={user}
            devices={devices}
            onNavigate={setCurrentScreen}
            onControlDevice={handleControlDevice}
            getDeviceIcon={getDeviceIcon}
            getStatusColor={getStatusColor}
          />
        );
      case "devices":
        return (
          <Devices
            devices={devices}
            pairCode={pairCode}
            onNavigate={setCurrentScreen}
            onGenerateCode={handleGenerateCode}
            onControlDevice={handleControlDevice}
            onShowNotification={showNotification}
            getDeviceIcon={getDeviceIcon}
            getStatusColor={getStatusColor}
          />
        );
      case "control":
        return (
          <Control
            selectedDevice={selectedDevice}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            filteredActions={filteredActions}
            showScreenshot={showScreenshot}
            setShowScreenshot={setShowScreenshot}
            onNavigate={setCurrentScreen}
            onHandleCommand={handleCommand}
            getDeviceIcon={getDeviceIcon}
            getStatusColor={getStatusColor}
          />
        );
      case "settings":
        return (
          <Settings
            user={user}
            onNavigate={setCurrentScreen}
            onSignOut={handleSignOut}
          />
        );
      default:
        return (
          <Home
            user={user}
            devices={devices}
            onNavigate={setCurrentScreen}
            onControlDevice={handleControlDevice}
            getDeviceIcon={getDeviceIcon}
            getStatusColor={getStatusColor}
          />
        );
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen m-h-screen flex items-center justify-center">
        <RingLoader color="#E55050" size={80} />
      </div>
    );
  }

  return (
    <div className="relative">
      {renderCurrentScreen()}
      <Notification notification={notification} />
    </div>
  );
};

export default Dashboard;
