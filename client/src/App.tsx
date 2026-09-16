import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useAuthStore } from "./store/authStore";
import {
  connectWebSocket,
  disconnectWebSocket,
} from "./lib/websocket";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import VetList from "./pages/VetList";
import VetDetails from "./pages/vetDetails";
import Appointments from "./pages/Appointments";
import VetAppointments from "./pages/VetAppointments";
import VetProfile from "./pages/VetProfile";
import CreateSlot from "./pages/CreateSlot";
import Notification from "./components/Notification";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) {
      disconnectWebSocket();
      return;
    }

    connectWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, [token]);

  return (
    <BrowserRouter>
    <Notification/>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["FARMER"]} />}>
          <Route path="/vets" element={<VetList />} />
          <Route path="/vets/:id" element={<VetDetails />} />
          <Route path="/appointments" element={<Appointments />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["VET"]} />}>
          <Route path="/vet/profile" element={<VetProfile />} />
          <Route path="/vet/slots/create" element={<CreateSlot />} />
          <Route path="/vet/appointments" element={<VetAppointments />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}