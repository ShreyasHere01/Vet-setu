import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Dashboard() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Dashboard
          </h1>

          {user && (
            <p className="mt-2 text-gray-600">
              Welcome, {user.name}
            </p>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="rounded bg-red-600 px-4 py-2 text-white"
        >
          Logout
        </button>
      </div>

      <div className="mt-8 space-y-3">
        {user?.role === "FARMER" && (
          <>
            <Link
              to="/vets"
              className="block rounded border p-4 hover:bg-gray-50"
            >
              Find Veterinarians
            </Link>

            <Link
              to="/appointments"
              className="block rounded border p-4 hover:bg-gray-50"
            >
              My Appointments
            </Link>
          </>
        )}

        {user?.role === "VET" && (
          <>
            <Link
              to="/vet/profile"
              className="block rounded border p-4 hover:bg-gray-50"
            >
              My Profile
            </Link>

            <Link
              to="/vet/slots/create"
              className="block rounded border p-4 hover:bg-gray-50"
            >
              Create Slot
            </Link>

            <Link
              to="/vet/appointments"
              className="block rounded border p-4 hover:bg-gray-50"
            >
              My Appointments
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
