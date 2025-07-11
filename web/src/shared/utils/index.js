import { Monitor, Smartphone } from "lucide-react";

export const getDeviceIcon = (type) => {
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

export const getStatusColor = (status) => {
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

export const getPerformanceColor = (performance) => {
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
