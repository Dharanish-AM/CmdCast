import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

// Components
import Auth from "./pages/auth/Auth";
import Dashboard from "./pages/main/Dashboard";
import { getUser, loginUser } from "./services/authOperations";
import { useNotification } from "./shared/hooks/useNotification";

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [loading, setLoading] = useState(true);
  const { notification, showNotification } = useNotification();
  const user = useSelector((state) => state.user.user);
  const devices = useSelector((state) => state.user.devices);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }
        console.log("Token:", token);
        const response = await getUser(token);
        if (response.status === 200 && response.data?.user) {
          dispatch({
            type: "SET_AUTH",
            payload: {
              isAuthenticated: true,
              user: response.data.user,
              token,
            },
          });
          dispatch({
            type: "SET_USER",
            payload: {
              user: response.data.user,
              devices: response.data.user.devices,
            },
          });
        }
      } catch (error) {
        console.error("Error loading user session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, [dispatch]);

  const handleLogin = async (email, password) => {
    try {
      const response = await loginUser(email, password, dispatch);
      if (response?.success) {
        const { token, user } = response;
        console.log("Login response:", response);

        localStorage.setItem("token", token);
        dispatch({
          type: "SET_AUTH",
          payload: {
            isAuthenticated: true,
            user,
            token,
          },
        });
        dispatch({
          type: "SET_USER",
          payload: {
            user,
            devices: user.devices,
          },
        });

        if (typeof showNotification === "function") {
          showNotification("Login successful!", "success");
        } else {
          console.log("Login successful!");
        }
      } else {
        showNotification(
          "Login failed. Please check your credentials.",
          "error"
        );
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    dispatch({
      type: "SET_AUTH",
      payload: { user: null, token: null, isAuthenticated: false },
    });
    dispatch({
      type: "SET_USER",
      payload: { user: null, devices: [] },
    });
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="App">
      {notification && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg text-white transition duration-300 ${
            notification.type === "success"
              ? "bg-green-500"
              : notification.type === "error"
              ? "bg-red-500"
              : "bg-blue-500"
          }`}
        >
          {notification.message}
        </div>
      )}
      {isAuthenticated ? (
        <Dashboard user={user} devices={devices} onSignOut={handleSignOut} />
      ) : (
        <Auth onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
