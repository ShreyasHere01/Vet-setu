import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

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
import CreateReview from "./pages/CreateReview";

import VetProfile from "./pages/VetProfile";
import CreateSlot from "./pages/CreateSlot";

import Animals from "./pages/Animal";
import AddAnimal from "./pages/AddAnimal";
import AnimalDetails from "./pages/AnimalDetails";
import EditAnimal from "./pages/EditAnimal";

import AddVaccination from "./pages/AddVaccination";
import AddTreatment from "./pages/AddTreatment";

import Notification from "./components/Notification";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import VetReviews from "./pages/vet/VetReview";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import FarmerProfile from "./pages/FarmerProfile";

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
     {token && <Navbar />}
      {token && <Notification />}

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />
        </Route>

        <Route
          element={
            <ProtectedRoute allowedRoles={["FARMER"]} />
          }
        >
          <Route
            path="/vets"
            element={<VetList />}
          />

          <Route
            path="/vets/:id"
            element={<VetDetails />}
          />

          <Route
            path="/appointments"
            element={<Appointments />}
          />

          <Route
            path="/create-review"
            element={<CreateReview />}
          />

          <Route
            path="/animals"
            element={<Animals />}
          />

          <Route
            path="/animals/add"
            element={<AddAnimal />}
          />

          <Route
            path="/animals/:id/edit"
            element={<EditAnimal />}
          />

          <Route
            path="/animals/:id"
            element={<AnimalDetails />}
          />

          <Route
            path="/animals/:id/vaccination/add"
            element={<AddVaccination />}
          />

          <Route
            path="/animals/:id/treatment/add"
            element={<AddTreatment />}
          />
        </Route>

        <Route
          element={
            <ProtectedRoute allowedRoles={["VET"]} />
          }
        >
          <Route
            path="/vet/profile"
            element={<VetProfile />}
          />

          <Route
            path="/vet/slots/create"
            element={<CreateSlot />}
          />

          <Route
            path="/vet/appointments"
            element={<VetAppointments />}
          />

          <Route
            path="/vet/reviews"
            element={<VetReviews />}
          />

          <Route
            path="/vet/farmer/:userId"
            element={<FarmerProfile />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}