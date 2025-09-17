import { Route, Routes } from "react-router-dom"
import Login from "./pages/Login";
import DashBoard from "./pages/DashBoard";
import './App.css';
import NotFound from "./pages/NotFound";
import DataEntry from "./pages/DataEntry";
import SubstationEntry from "./pages/SubstationEntry";
import Employees from "./pages/Employees";
import SubstationDetails from "./pages/SubstationDetails";
import TreeStructure from "./pages/Hierarchy";
import AssignEmployee from "./pages/AssignEmployee";
import Substations from "./pages/Substation";
import Chatbot from "./pages/Chatbot";
function App() {
  return (
      <div className="w-[100vw] h-[100vh] min-h-screen flex  bg-[#211F1E] overflow-x-hidden relative">
        <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/dashboard" element={<DashBoard/>}/>
        <Route path="/data-entry" element={<DataEntry/>}/>
        <Route path="/substation-entry" element={<SubstationEntry/>}/>
        <Route path="/substations" element={<Substations />} />
        <Route path="/employees" element={<Employees/>}/>
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="*" element={<NotFound/>}/>
        <Route path="/assign-employee" element={<AssignEmployee />} />
        <Route path="/substation/:substationName" element={<SubstationDetails />} />
        <Route path="/hierarchy" element={<TreeStructure />} />
      </Routes>
    </div>
  );
}

export default App;
