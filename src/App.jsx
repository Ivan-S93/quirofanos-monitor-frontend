import { useEffect, useState } from "react";
import { api } from "./api";
import { connectWS } from "./ws";

export default function App() {
  const [quirofanos, setQuirofanos] = useState([]);
  const [tick, setTick] = useState(0); // para forzar re-render cada segundo

  useEffect(() => {
    // Datos iniciales
    api.get("/quirofanos/estado")
      .then(r => setQuirofanos(r.data))
      .catch(err => console.error(err));

    // WebSocket
    const client = connectWS(data => setQuirofanos(data));

    // Intervalo para actualizar progreso cada segundo
    const interval = setInterval(() => setTick(t => t + 1), 1000);

    return () => {
      client.deactivate();
      clearInterval(interval);
    };
  }, []);

  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleString();
  };

  // Calcula progreso de la cirugía en porcentaje
  const calcularProgreso = (cirugia) => {
    if (!cirugia) return 0;
    const { horaInicio, duracionEstimada } = cirugia;
    if (!horaInicio || !duracionEstimada) return 0;

    const inicio = new Date(horaInicio).getTime();
    const ahora = Date.now();
    const duracionMs = duracionEstimada * 60 * 1000;
    const transcurrido = ahora - inicio;
    const progreso = Math.min(Math.max((transcurrido / duracionMs) * 100, 0), 100);

    return progreso;
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <h1 className="text-4xl font-bold mb-6 text-center">
        MONITOR DE QUIRÓFANOS
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quirofanos.map(q => {
          const cirugia = q.cirugiaActiva;
          const progreso = calcularProgreso(cirugia);

          return (
            <div
              key={q.id}
              className={`rounded-xl p-5 shadow-xl transition-all
                ${q.estado === "OCUPADO" ? "bg-red-600" : "bg-green-600"}`}
            >
              <div className="text-2xl font-bold mb-2">{q.nombre}</div>

              <div className="text-sm mb-2">
                Estado: <span className="font-semibold">{q.estado}</span>
              </div>

              <div className="bg-black/30 rounded p-3 text-sm mb-3">
                <p>📝 <b>Cirugía:</b> {cirugia?.descripcion || "Sin cirugía activa"}</p>
                <p>⏰ <b>Inicio:</b> {formatFecha(cirugia?.horaInicio)}</p>
                <p>⏳ <b>Duración:</b> {cirugia?.duracionEstimada || "-"} min</p>

                {cirugia && (
                  <div className="mt-2 w-full">
                    {/* porcentaje arriba */}
                    <div className="text-right text-xs mb-1">{progreso.toFixed(0)}%</div>

                    {/* barra de progreso */}
                    <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-white h-4 rounded-full transition-all duration-500 ease-linear"
                        style={{ width: `${progreso}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-white/30 pt-2 text-xs">
                <p className="opacity-80">Última finalizada:</p>
                <p>📝 {q.ultimaDescripcion || "Ninguna"}</p>
                <p>⏰ {formatFecha(q.ultimaHoraFin)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
