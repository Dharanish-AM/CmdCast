import React, { useState, useEffect } from "react";
import axios from "axios";

// Components
import LoginScreen from "./components/LoginScreen";
import DashboardScreen from "./components/DashboardScreen";
import DevicesScreen from "./components/DevicesScreen";
import ControlScreen from "./components/ControlScreen";
import SettingsScreen from "./components/SettingsScreen";
import Notification from "./components/Notification";

// Hooks
import { useNotification } from "./hooks/useNotification";

// Utils
import { getDeviceIcon, getStatusColor } from "./utils/deviceUtils";

// Constants
import { MOCK_DEVICES, QUICK_ACTIONS, API_CONFIG } from "./constants/data";

function App() {
  const [currentScreen, setCurrentScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [devices] = useState(MOCK_DEVICES);
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

  const handleLogin = (email, password) => {
    const name = email.split("@")[0];
    console.log(password);
    setUser({ email, name: name.charAt(0).toUpperCase() + name.slice(1) });
    setCurrentScreen("dashboard");
    showNotification("Welcome to CmdCast!", "success");
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
    console.log(action);
    try {
      const response = await axios.post(
        ` ${import.meta.env.VITE_API_URL}/api/users/send-command`,
        {
          command: action.value,
          deviceId_id: "686e9159d6a9a3366d7d0d98",
          userId: "686e85aebdffec94b27de135",
        },
        {}
      );
      console.log(response);
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
    setUser(null);
    setCurrentScreen("login");
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
      case "login":
        return <LoginScreen onLogin={handleLogin} />;
      case "dashboard":
        return (
          <DashboardScreen
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
          <DevicesScreen
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
          <ControlScreen
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
          <SettingsScreen
            user={user}
            onNavigate={setCurrentScreen}
            onSignOut={handleSignOut}
          />
        );
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <div className="relative">
      {renderCurrentScreen()}
      <Notification notification={notification} />
    </div>
  );
}

export default App;
