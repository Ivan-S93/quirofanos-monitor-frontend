import { Routes, Route, Navigate } from "react-router-dom";
import Monitor from "./Monitor";
import OperatorPanel from "./OperatorPanel";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/monitor" />} />
      <Route path="/monitor" element={<Monitor />} />
      <Route path="/operador" element={<OperatorPanel />} />
    </Routes>
  );
}
