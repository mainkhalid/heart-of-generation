import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/shared/SideBar";
import { AdminHeader } from "../components/shared/AdminHeader";
export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      <div className="">
        <div className="flex flex-col md:flex-row gap-6">
          <Sidebar />
          <main className="flex-1 bg-white p-2 rounded-lg shadow">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
