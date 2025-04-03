import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout.jsx";
import DashboardHome from "./DashboardHome.jsx";

// Appointments component
const Appointments = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold">Your Appointments</h2>
      <p className="mt-2">Manage your appointments here</p>
      {/* Appointment-specific content goes here */}
    </div>
  );
};

const Dashboardpage = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/appointments" element={<Appointments />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboardpage;
