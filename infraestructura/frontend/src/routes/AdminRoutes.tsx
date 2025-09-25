import { Route, Routes } from "react-router-dom"
import DashboardAdmin from '@/pages/DashboardAdmin';

function AdminRoutes() {
  return (
    <Routes>
       <Route path="/dashboard" element={<DashboardAdmin/>} />
    </Routes>
  );
}

export default AdminRoutes;