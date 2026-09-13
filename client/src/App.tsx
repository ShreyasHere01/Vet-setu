import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import VetList from "./pages/VetList";
import ProtectedRoute from "./components/ProtectedRoute";
import VetDetails from "./pages/vetDetails";  
import Appointments from "./pages/Appointments";
import VetAppointments from "./pages/VetAppointments";
import VetProfile from "./pages/VetProfile";
import CreateSlot from "./pages/CreateSlot";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["FARMER"]} />}>
          <Route path="/vets" element={<VetList />} />
          <Route path="/vets/:id" element={<VetDetails/>}/>
          <Route path="/appointments" element={<Appointments/>}/>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["VET"]} />}>
        <Route path="/vet/profile" element={<VetProfile />} />
            <Route
             path="/vet/appointments"
            element={<VetAppointments />}
             />
              <Route
               path="/vet/slots/create"
                element={<CreateSlot />}
               />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}