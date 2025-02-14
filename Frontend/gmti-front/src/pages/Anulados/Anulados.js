import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import './Anulados.css';
const Anulados = () => {
  const navigate = useNavigate();
  const [anulados, setAnulados] = useState([]);
  const [editando, setEditando] = useState(null);
  const [fechas, setFechas] = useState({ fecha_abono: ""});
  
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      console.log(token);
      try {
        const response = await fetch(
          `http://localhost:8000/verify-token/${token}`
        );
        if (!response.ok) {
          throw new Error('Token verification failed');
        }
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/');
      }
    };
  
    const fetchVentas = async () => {
      try {
        const response = await fetch("http://localhost:8001/anulados");
        if (!response.ok) {
          throw new Error("Failed to fetch ventas");
        }
        const data = await response.json();
        setAnulados(data);
      } catch (error) {
        console.error("Error fetching ventas:", error);
      }
    };
  
    verifyToken();
    fetchVentas();
  }, [navigate]);
  
  const handleUpdateOrdenServ = async (nro_comprobante, nuevoOrdenServ) => {
    try {
      const response = await fetch(`http://localhost:8001/facturas/${nro_comprobante}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nro_ord_serv_nc: nuevoOrdenServ || null }),
      });

      if (!response.ok) throw new Error("Error al actualizar el Nro Orden Serv");

      setAnulados(prevAnulados =>
        prevAnulados.map(anulados =>
          anulados.nro_comprobante === nro_comprobante
            ? { ...anulados, nro_ord_serv_nc: nuevoOrdenServ }
            : anulados
        )
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const toggleEstado = async (nro_comprobante, campo, valorActual) => {
    let nuevoValor = valorActual === null ? true : valorActual === true ? false : null;
    try {
      const response = await fetch(`http://localhost:8001/facturas/${nro_comprobante}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [campo]: nuevoValor }),
      });
      if (!response.ok) throw new Error(`Error al actualizar ${campo}`);
      setAnulados(prevAnulados =>
        prevAnulados.map(anulados =>
          anulados.nro_comprobante === nro_comprobante
            ? { ...anulados, [campo]: nuevoValor }
            : anulados
        )
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleUpdateObservacion = async (nro_comprobante, nuevaObservacion) => {
    try {
      const response = await fetch(`http://localhost:8001/facturas/${nro_comprobante}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observacion: nuevaObservacion || null }),
      });
      if (!response.ok) throw new Error("Error al actualizar la observación");
      setAnulados(prevAnulados =>
        prevAnulados.map(anulados =>
          anulados.nro_comprobante === nro_comprobante
            ? { ...anulados, observacion: nuevaObservacion }
            : anulados
        )
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const observacionesOpciones = [
    "ADJUNTAR NOTA DE CREDITO",
    "OK",
    "REGULARIZAR"
  ];

  const handleEdit = (anulados) => {
    setEditando(anulados.nro_comprobante);
    setFechas({
      fecha_nota_credito: anulados.fecha_nota_credito ? anulados.fecha_nota_credito.split("T")[0] : "",
    });
  };
  
  
  const handleSave = (nro_comprobante) => {
    fetch(`http://127.0.0.1:8001/facturas/${nro_comprobante}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fechas),
    })
      .then((response) => response.json())
      .then(() => {
        setAnulados((prevAnulados) =>
          prevAnulados.map((anulados) =>
            anulados.nro_comprobante === nro_comprobante
              ? { ...anulados, ...fechas }
              : anulados
          )
        );
        setEditando(null);
      })
      .catch((error) => console.error("Error al actualizar:", error));
  };

  
  
  return (
    <div className="facturas-layout">
        <Sidebar />
        <div className="facturas-container">
          <header className="facturas-header">
            <h1>Gestión de Anulados</h1>
            <p>Consulta, edita y administra tus Anulados de manera eficiente.</p>
          </header>
          <div className="table-container">
            <table className="facturas-table">
              <thead>
                <tr>
                  <th>FECHA</th>
                  <th>NRO COMPROBANTE</th>
                  <th>CLASIFICACION</th>
                  <th>NRO NOTA DE CREDITO</th>
                  <th>NOTA DE CREDITO</th>
                  <th>OBSERVACION</th>
                  <th>FECHA NOTA CREDITO</th>
                  <th>EDITAR FECHAS</th>
                </tr>
              </thead>
              <tbody>
                {anulados.map((anulados, index) => (
                  <tr key={index}>
                    <td>{anulados.fecha}</td>
                    <td>{anulados.nro_comprobante}</td>
                    <td>{anulados.clasificacion}</td>
                    <td>
                      <input
                        type="text"
                        value={anulados.nro_ord_serv_nc || ""}
                        onChange={(e) => {
                          const nuevoOrdenServ = e.target.value;
                          setAnulados(prevAnulados =>
                            prevAnulados.map(a =>
                              a.nro_comprobante === anulados.nro_comprobante
                                ? { ...a, nro_ord_serv_nc: nuevoOrdenServ }
                                : a
                            )
                          );
                        }}
                        onBlur={(e) => handleUpdateOrdenServ(anulados.nro_comprobante, e.target.value)}
                        className="editable-input"
                        style={{ width: "150px", textAlign: "center", height: "25px" }}
                      />
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleEstado(anulados.nro_comprobante, "orden_serv_compr", anulados.orden_serv_compr)}
                        style={{ width: "15px", height: "25px" }}
                      >
                        {anulados.orden_serv_compr === true ? "✔" : anulados.orden_serv_compr === false ? "✖" : "-"}
                      </button>
                    </td>
                    <td>
                      <input
                        type="text"
                        list="observaciones"
                        value={anulados.observacion || ""}
                        onChange={(e) => handleUpdateObservacion(anulados.nro_comprobante, e.target.value)}
                        className="editable-input"
                        style={{ width: "250px", textAlign: "center", height: "25px" }}
                      />
                      <datalist id="observaciones">
                        {observacionesOpciones.map((opcion, index) => (
                          <option key={index} value={opcion} />
                        ))}
                      </datalist>
                    </td>
                    <td className="border p-2">
                      {editando === anulados.nro_comprobante ? (
                        <input
                          type="date"
                          value={fechas.fecha_nota_credito}
                          onChange={(e) => setFechas({ ...fechas, fecha_nota_credito: e.target.value })}
                          className="border p-1"
                        />
                      ) : (
                        anulados.fecha_nota_credito || "No registrada"
                      )}
                    </td>
                    <td className="border p-2">
                      {editando === anulados.nro_comprobante ? (
                        <button
                          onClick={() => handleSave(anulados.nro_comprobante)}
                          className="bg-green-500 text-white px-2 py-1 rounded"
                        >
                          Guardar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(anulados)}
                          className="bg-blue-500 text-white px-2 py-1 rounded"
                        >
                          Editar
                        </button>
                      )}
                    </td>       
                  </tr>
                ))}
              </tbody>
            </table> 
          </div> 
        </div>
    </div>
  );
};

export default Anulados;