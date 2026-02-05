import { useEffect, useState } from "react";
import { api } from "./api";
import { connectWS } from "./ws";

export default function App() {
  const [quirofanos, setQuirofanos] = useState([]);

  useEffect(() => {
    api.get("/quirofanos/estado").then(r => setQuirofanos(r.data));

    const client = connectWS(data => setQuirofanos(data));
    return () => client.deactivate();
  }, []);

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <h1 className="text-4xl font-bold mb-6 text-center">
        MONITOR DE QUIRÓFANOS
      </h1>

      <div className="grid grid-cols-3 gap-6">
        {quirofanos.map(q => (
          <div
            key={q.id}
            className={`rounded-xl p-6 text-center text-2xl font-bold shadow-xl
              ${q.estado === "OCUPADO" ? "bg-red-600" : "bg-green-600"}`}
          >
            <div>{q.nombre}</div>
            <div className="text-lg mt-2">{q.tipo}</div>
            <div className="mt-4">{q.estado}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
