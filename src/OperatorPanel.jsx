import { useEffect, useState } from "react";
import { api } from "./api";
import { connectWS } from "./ws";

export default function OperatorPanel() {
    const [quirofanos, setQuirofanos] = useState([]);
    const [form, setForm] = useState({
        quirofanoId: "",
        descripcion: "",
        duracionEstimada: ""
    });

    useEffect(() => {
        api.get("/quirofanos/estado").then(r => setQuirofanos(r.data));
        const client = connectWS(data => setQuirofanos(data));
        return () => client.deactivate();
    }, []);

    const iniciar = async () => {
        const qId = Number(form.quirofanoId);
        const dur = Number(form.duracionEstimada);

        if (!qId || !form.descripcion.trim() || !dur || dur <= 0) {
            alert("Ingrese quirófano, descripción y duración válida en minutos");
            return;
        }

        await api.post(
            `/cirugias/iniciar/${qId}?descripcion=${encodeURIComponent(form.descripcion)}&duracion=${dur}`
        );


        setForm({ quirofanoId: "", descripcion: "", duracionEstimada: "" });
    };

    const finalizar = async (id) => {
        await api.post(`/cirugias/finalizar/${id}`);
    };

    const quirofanosOrdenados = [...quirofanos].sort((a, b) => {
        const na = parseInt(a.nombre.replace(/\D/g, ""));
        const nb = parseInt(b.nombre.replace(/\D/g, ""));
        return na - nb;
    });

    return (
        <div className="p-6 bg-blue-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Panel Operador</h1>

            <div className="bg-white p-4 rounded shadow mb-6">
                <h2 className="font-bold mb-3">Iniciar cirugía</h2>

                <div className="flex flex-wrap items-center gap-3">
                    {/* QUIROFANO */}
                    <select
                        className="border p-2"
                        value={form.quirofanoId}
                        onChange={e =>
                            setForm({ ...form, quirofanoId: e.target.value })
                        }
                    >
                        <option value="">Seleccione quirófano</option>
                        {quirofanosOrdenados
                            .filter(q => q.estado === "DISPONIBLE")
                            .map(q => (
                                <option key={q.id} value={q.id}>
                                    {q.nombre}
                                </option>
                            ))}
                    </select>

                    {/* DESCRIPCION */}
                    <input
                        className="border p-2 w-64"
                        placeholder="Descripción de la cirugía"
                        value={form.descripcion}
                        onChange={e =>
                            setForm({ ...form, descripcion: e.target.value })
                        }
                    />

                    {/* DURACION */}
                    <div className="flex flex-col mt-3 md:mt-0">
                        <input
                            type="number"
                            min="1"
                            step="1"
                            className="border p-2 w-64"
                            placeholder="Duración estimada en minutos"
                            value={form.duracionEstimada}
                            onChange={e => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val)) {
                                    setForm({ ...form, duracionEstimada: val });
                                }
                            }}
                        />

                    </div>

                    {/* BOTON */}
                    <button
                        onClick={iniciar}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Iniciar
                    </button>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quirofanosOrdenados.map(q => (
                    <div key={q.id} className="bg-white p-4 rounded shadow">
                        <h3 className="font-bold">{q.nombre}</h3>
                        <p>Estado: {q.estado}</p>

                        {q.estado === "OCUPADO" && (
                            <button
                                onClick={() => finalizar(q.id)}
                                className="mt-2 bg-red-600 text-white px-3 py-1 rounded"
                            >
                                Finalizar
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
