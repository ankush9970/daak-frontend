import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import UploadDak from "./UploadDak";
import DakReports from "./DakReports";
import SendReminder from "./SendReminder";
import UserActions from "./UserActions";
import ProfileEditModal from "./ProfileEditModal";
import ChangePasswordModal from "./ChangePasswordModal";
import { Helmet } from "react-helmet";
import NotificationBell from "./NotificationBell";
import ManageUsers from "./ManageUsers";
import AdviceReport from "./AdviceReport";
import ManageHead from "./ManageHead";
import ManageGroup from "./ManageGroup";
import ManageWAP from "./ManageWAP";
import UserWAP from "./UserWAP";

export default function Dashboard() {
  const { user, logout, setUser } = useAuth();
  const [active, setActive] = useState("");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);

  if (!user) return null;

  const { name, role, permissions } = user;

  const hasPermission = (p) =>
    role.toLowerCase() === "admin" ||
    permissions.includes("ALL") ||
    permissions.includes(p);

  const menuItems = [
    { key: "UPLOAD", label: "Upload & Forward Dak", component: <UploadDak /> },
    // { key: "FORWARD", label: "Forward Dak", component: <ForwardDak /> },
    { key: "REPORT", label: "Dak Reports", component: <DakReports /> },
    { key: "REMINDER", label: "Send Reminder", component: <SendReminder /> },
    { key: "USER_ACTIONS", label: "User Actions", component: <UserActions /> },
    { key: "MANAGE_USERS", label: "Manage Users", component: <ManageUsers /> },
    { key: "MANAGE-WAP", label: "Manage WAP", component: <ManageWAP /> },
    {
      key: "MANAGE_HEAD",
      label: "Manage Group Head",
      component: <ManageHead />,
    },
    { key: "MANAGE_GROUP", label: "Manage Groups", component: <ManageGroup /> },
    {
      key: "MANAGE_ADVICE",
      label: "Manage Advice",
      component: <AdviceReport />,
    },
    { key: "USER-WAP", label: "Work Assigned", component: <UserWAP /> },
  ];

  const allowedItems = menuItems.filter((item) => {
    if (item.key === "USER_ACTIONS") {
      return (
        hasPermission("READ") ||
        hasPermission("ACTION") ||
        hasPermission("REQUEST_ADVICE")
      );
    }
    return hasPermission(item.key);
  });

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Helmet>
        <title>Dashboard</title>
      </Helmet>

      {/* Fixed Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-white shadow-lg flex flex-col justify-between">
        <div className="flex flex-col h-full">
          {/* Profile */}
          <div className="flex flex-col items-center p-6 border-b relative">
            <img
              className="w-20 h-20 rounded-full object-cover mb-2"
              src="https://avatar.iran.liara.run/public/boy?username=Ash"
              alt="Profile"
            />
            <div className="flex items-center gap-2 relative">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">{name}</h2>
                <NotificationBell />
              </div>
            </div>

            <p className="text-gray-500 text-sm capitalize">{role}</p>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto">
            {allowedItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`w-full text-left px-6 py-3 hover:bg-gray-200 ${
                  active === item.key ? "bg-gray-200 font-bold" : ""
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="p-6 border-t">
            <button
              onClick={() => setShowEditProfile(true)}
              className="w-full text-left px-4 py-2 mb-2 hover:bg-gray-200 rounded"
            >
              Edit Profile
            </button>
            <button
              onClick={() => setShowChangePass(true)}
              className="w-full text-left px-4 py-2 mb-2 hover:bg-gray-200 rounded"
            >
              Change Password
            </button>
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 bg-red-500 text-white rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content with margin-left */}
      <main className="flex-1 ml-64 p-8">
        {allowedItems.find((item) => item.key === active)?.component || (
          <h1 className="text-2xl font-bold">Welcome, {name}!</h1>
        )}
      </main>

      {/* Modals */}
      {showEditProfile && (
        <ProfileEditModal
          user={user}
          onClose={() => setShowEditProfile(false)}
          onUpdated={(update) => {
            setUser({ ...user, name: update.name });
          }}
        />
      )}
      {showChangePass && (
        <ChangePasswordModal onClose={() => setShowChangePass(false)} />
      )}
    </div>
  );
}
