import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./Servicios.css";

const Servicios = () => {
  const navigate = useNavigate();
  const [facturas, setFacturas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [fechas, setFechas] = useState({ fecha_abono: "", fecha_detraccion: "" });

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`http://localhost:8000/verify-token/${token}`);
        if (!response.ok) {
          throw new Error("Token verification failed");
        }
      } catch (error) {
        localStorage.removeItem("token");
        navigate("/");
      }
    };

    verifyToken();
  }, [navigate]);

  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        const response = await fetch("http://localhost:8001/servicios");
        if (!response.ok) throw new Error("Error al obtener los servicios");
        const data = await response.json();

        // Filtrar solo las facturas con clasificacion "SERVICIO" y ordenarlas por fecha descendente
        const facturasServicio = data
          .filter(factura => factura.clasificacion === "SERVICIO")
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        setFacturas(facturasServicio);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchFacturas();
  }, []);

  const handleUpdateSIAF = async (nro_comprobante, nuevoSIAF) => {
    try {
      const response = await fetch(`http://localhost:8001/facturas/${nro_comprobante}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nro_siaf: nuevoSIAF || null }),
      });

      if (!response.ok) throw new Error("Error al actualizar el SIAF");

      setFacturas(prevFacturas =>
        prevFacturas.map(factura =>
          factura.nro_comprobante === nro_comprobante
            ? { ...factura, nro_siaf: nuevoSIAF }
            : factura
        )
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleUpdateOrdenServ = async (nro_comprobante, nuevoOrdenServ) => {
    try {
      const response = await fetch(`http://localhost:8001/facturas/${nro_comprobante}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nro_ord_serv_nc: nuevoOrdenServ || null }),
      });

      if (!response.ok) throw new Error("Error al actualizar el Nro Orden Serv");

      setFacturas(prevFacturas =>
        prevFacturas.map(factura =>
          factura.nro_comprobante === nro_comprobante
            ? { ...factura, nro_ord_serv_nc: nuevoOrdenServ }
            : factura
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
      setFacturas(prevFacturas =>
        prevFacturas.map(factura =>
          factura.nro_comprobante === nro_comprobante
            ? { ...factura, [campo]: nuevoValor }
            : factura
        )
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleInputChange = (e, nro_comprobante, field) => {
    let rawValue = e.target.value.replace(/[^0-9.]/g, "");
    let numericValue = parseFloat(rawValue) || 0;
    
    setFacturas(prevFacturas => prevFacturas.map(factura =>
      factura.nro_comprobante === nro_comprobante ? { ...factura, [field]: numericValue } : factura
    ));
  };

  const handleBlur = (nro_comprobante, field, value) => {
    handleUpdateField(nro_comprobante, field, value);
  };
  
  const handleUpdateObservacion = async (nro_comprobante, nuevaObservacion) => {
    try {
      const response = await fetch(`http://localhost:8001/facturas/${nro_comprobante}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observacion: nuevaObservacion || null }),
      });
      if (!response.ok) throw new Error("Error al actualizar la observación");
      setFacturas(prevFacturas =>
        prevFacturas.map(factura =>
          factura.nro_comprobante === nro_comprobante
            ? { ...factura, observacion: nuevaObservacion }
            : factura
        )
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(value || 0);
  };

  const handleEdit = (factura) => {
    setEditando(factura.nro_comprobante);
    setFechas({
      fecha_abono: factura.fecha_abono ? factura.fecha_abono.split("T")[0] : "",
      fecha_detraccion: factura.fecha_detraccion ? factura.fecha_detraccion.split("T")[0] : "",
    });
  };

  const handleSave = (nro_comprobante) => {
    fetch(`http://127.0.0.1:8000/facturas/${nro_comprobante}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fechas),
    })
      .then((response) => response.json())
      .then(() => {
        setFacturas((prevFacturas) =>
          prevFacturas.map((factura) =>
            factura.nro_comprobante === nro_comprobante
              ? { ...factura, ...fechas }
              : factura
          )
        );
        setEditando(null);
      })
      .catch((error) => console.error("Error al actualizar:", error));
  };

  const observacionesOpciones = [
    "FALTA COMPROBANTE",
    "FALTA DETRACCION",
    "FALTA ORDEN",
    "FALTA COMPROBANTE / FALTA DETRACCION",
    "FALTA DETRACCION / FALTA ORDEN",
    "FALTA COMPROBANTE / FALTA ORDEN",
    "FALTA COMPROBANTE / FALTA DETRACCION / FALTA ORDEN",
    "OK",
    "REGULARIZAR"
  ];

  const handleUpdateField = async (nro_comprobante, field, value) => {
    try {
      const updatedFacturas = facturas.map(factura => {
        if (factura.nro_comprobante === nro_comprobante) {
          const newFactura = {
            ...factura,
            [field]: value,
          };
          newFactura.saldo = (newFactura.importe_total || 0) - (newFactura.monto_comprobante || 0) - (newFactura.monto_detraccion || 0);
          return newFactura;
        }
        return factura;
      });

      const updatedFactura = updatedFacturas.find(f => f.nro_comprobante === nro_comprobante);
      if (!updatedFactura) return;

      const response = await fetch(`http://localhost:8001/facturas/${nro_comprobante}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [field]: value || null,
          saldo: updatedFactura.saldo,
        }),
      });

      if (!response.ok) throw new Error(`Error al actualizar ${field}`);

      setFacturas(updatedFacturas);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="facturas-layout">
      <Sidebar />
      <div className="facturas-container">
        <header className="facturas-header">
          <h1>Gestión de Servicios</h1>
          <p>Consulta, edita y administra tus servicios de manera eficiente.</p>
        </header>

        {/* Tabla de Facturas */}
        <div className="table-container">
          <table className="facturas-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Nro Comprobante</th>
                <th>Estado</th>
                <th>Nro Servicio</th>
                <th>Nro SIAF</th>
                <th>Comprobante</th>
                <th>Detraccion</th>
                <th>Orden Servicio</th>
                <th>Observación</th>
                <th>Monto Comprobante</th>
                <th>Monto Detracción</th>
                <th>Saldo</th>
                <th>Fecha Abono</th>
                <th>Fecha Detracción</th>
                <th>Editar Fechas</th>
              </tr>
            </thead>
            <tbody>
              {facturas.length > 0 ? (
                facturas.map((factura) => (
                  <tr key={factura.nro_comprobante}>
                    <td>{new Date(factura.fecha).toISOString().split("T")[0]}</td>
                    <td>{factura.nro_comprobante}</td>
                    <td>{factura.estado}</td>
                    <td>
                      <input
                        type="text"
                        value={factura.nro_ord_serv_nc || ""}
                        onChange={(e) => {
                          const nuevoOrdenServ = e.target.value;
                          setFacturas(prevFacturas =>
                            prevFacturas.map(f =>
                              f.nro_comprobante === factura.nro_comprobante
                                ? { ...f, nro_ord_serv_nc: nuevoOrdenServ }
                                : f
                            )
                          );
                        }}
                        onBlur={(e) => handleUpdateOrdenServ(factura.nro_comprobante, e.target.value)}
                        className="editable-input"
                        style={{ width: "250px",textAlign: "center", height: "25px"  }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={factura.nro_siaf || ""}
                        onChange={(e) => {
                          const nuevoSIAF = e.target.value;
                          setFacturas(prevFacturas =>
                            prevFacturas.map(f =>
                              f.nro_comprobante === factura.nro_comprobante
                                ? { ...f, nro_siaf: nuevoSIAF }
                                : f
                            )
                          );
                        }}
                        onBlur={(e) => handleUpdateSIAF(factura.nro_comprobante, e.target.value)}
                        className="editable-input"
                        style={{ width: "40px",textAlign: "center", height: "25px" }}
                      />
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleEstado(factura.nro_comprobante, "comprobante_pago", factura.comprobante_pago)}
                        style={{ width: "15px", height: "25px" }}
                      >
                        {factura.comprobante_pago === true ? "✔" : factura.comprobante_pago === false ? "✖" : "-"}
                      </button>
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleEstado(factura.nro_comprobante, "comprobante_detraccion", factura.comprobante_detraccion)}
                        style={{ width: "15px", height: "25px" }}
                      >
                        {factura.comprobante_detraccion === true ? "✔" : factura.comprobante_detraccion === false ? "✖" : "-"}
                      </button>
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleEstado(factura.nro_comprobante, "orden_serv_compr", factura.orden_serv_compr)}
                        style={{ width: "15px", height: "25px" }}
                      >
                        {factura.orden_serv_compr === true ? "✔" : factura.orden_serv_compr === false ? "✖" : "-"}
                      </button>
                    </td>
                    <td>
                      <input
                        type="text"
                        list="observaciones"
                        value={factura.observacion || ""}
                        onChange={(e) => handleUpdateObservacion(factura.nro_comprobante, e.target.value)}
                        className="editable-input"
                        style={{ width: "250px", textAlign: "center", height: "25px" }}
                      />
                      <datalist id="observaciones">
                        {observacionesOpciones.map((opcion, index) => (
                          <option key={index} value={opcion} />
                        ))}
                      </datalist>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={formatCurrency(factura.monto_comprobante)}
                        onChange={(e) => handleInputChange(e, factura.nro_comprobante, "monto_comprobante")}
                        onBlur={() => handleBlur(factura.nro_comprobante, "monto_comprobante", factura.monto_comprobante)}
                        className="editable-input"
                        style={{ textAlign: "left" , width: "100px"}}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={formatCurrency(factura.monto_detraccion)}
                        onChange={(e) => handleInputChange(e, factura.nro_comprobante, "monto_detraccion")}
                        onBlur={() => handleBlur(factura.nro_comprobante, "monto_detraccion", factura.monto_detraccion)}
                        className="editable-input"
                        style={{ textAlign: "left", width: "100px" }}
                      />
                    </td>
                    <td>{formatCurrency(factura.saldo)}</td>
                    <td className="border p-2">
                      {editando === factura.nro_comprobante ? (
                        <input
                          type="date"
                          value={fechas.fecha_abono}
                          onChange={(e) => setFechas({ ...fechas, fecha_abono: e.target.value })}
                          className="border p-1"
                        />
                      ) : (
                        factura.fecha_abono || "No registrada"
                      )}
                    </td>
                    <td className="border p-2">
                      {editando === factura.nro_comprobante ? (
                        <input
                          type="date"
                          value={fechas.fecha_detraccion}
                          onChange={(e) => setFechas({ ...fechas, fecha_detraccion: e.target.value })}
                          className="border p-1"
                        />
                      ) : (
                        factura.fecha_detraccion || "No registrada"
                      )}
                    </td>
                    <td className="border p-2">
                      {editando === factura.nro_comprobante ? (
                        <button
                          onClick={() => handleSave(factura.nro_comprobante)}
                          className="bg-green-500 text-white px-2 py-1 rounded"
                        >
                          Guardar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(factura)}
                          className="bg-blue-500 text-white px-2 py-1 rounded"
                        >
                          Editar
                        </button>
                      )}
                    </td> 
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No hay facturas de servicios disponibles</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Servicios;
