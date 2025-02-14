import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./Ventas.css";

const Ventas = () => {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [fechas, setFechas] = useState({ fecha_abono: ""});
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

    const fetchVentas = async () => {
      try {
        const response = await fetch("http://localhost:8001/ventas");
        if (!response.ok) {
          throw new Error("Failed to fetch ventas");
        }
        const data = await response.json();
        setVentas(data);
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

      setVentas(prevVentas =>
        prevVentas.map(venta =>
          venta.nro_comprobante === nro_comprobante
            ? { ...venta, nro_ord_serv_nc: nuevoOrdenServ }
            : venta
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
      setVentas(prevVentas =>
        prevVentas.map(venta =>
          venta.nro_comprobante === nro_comprobante
            ? { ...venta, [campo]: nuevoValor }
            : venta
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
      setVentas(prevVentas =>
        prevVentas.map(venta =>
          venta.nro_comprobante === nro_comprobante
            ? { ...venta, observacion: nuevaObservacion }
            : venta
        )
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  const handleInputChange = (e, nro_comprobante, field) => {
    let rawValue = e.target.value.replace(/[^0-9.]/g, "");
    let numericValue = parseFloat(rawValue) || 0;
    
    setVentas(prevVentas => prevVentas.map(venta =>
      venta.nro_comprobante === nro_comprobante ? { ...venta, [field]: numericValue } : venta
    ));
};

const handleBlur = (nro_comprobante, field, value) => {
  handleUpdateField(nro_comprobante, field, value);
};

const handleEdit = (venta) => {
  setEditando(venta.nro_comprobante);
  setFechas({
    fecha_abono: venta.fecha_abono ? venta.fecha_abono.split("T")[0] : "",
  });
};
const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(value || 0);
};


const handleSave = (nro_comprobante) => {
  fetch(`http://127.0.0.1:8001/facturas/${nro_comprobante}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fechas),
  })
    .then((response) => response.json())
    .then(() => {
      setVentas((prevVentas) =>
        prevVentas.map((venta) =>
          venta.nro_comprobante === nro_comprobante
            ? { ...venta, ...fechas }
            : venta
        )
      );
      setEditando(null);
    })
    .catch((error) => console.error("Error al actualizar:", error));
};

const handleUpdateField = async (nro_comprobante, field, value) => {
  try {
    const updatedVentas = ventas.map(venta => {
      if (venta.nro_comprobante === nro_comprobante) {
        const newVenta = {
          ...venta,
          [field]: value,
        };
        newVenta.saldo = (newVenta.importe_total || 0) - (newVenta.monto_comprobante || 0) - (newVenta.monto_detraccion || 0);
        return newVenta;
      }
      return venta;
    });

    const updatedVenta = updatedVentas.find(v => v.nro_comprobante === nro_comprobante);
    if (!updatedVenta) return;

    const response = await fetch(`http://localhost:8001/facturas/${nro_comprobante}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        [field]: value || null,
        saldo: updatedVenta.saldo,
      }),
    });

    if (!response.ok) throw new Error(`Error al actualizar ${field}`);

    setVentas(updatedVentas);
  } catch (error) {
    console.error("Error:", error);
  }
};



  const observacionesOpciones = [
    "FALTA COMPROBANTE",
    "FALTA ORDEN",
    "FALTA GUIA",
    "FALTA COTIZACION",
    "FALTA COMPROBANTE / FALTA ORDEN",
    "FALTA COMPROBANTE / FALTA GUIA",
    "FALTA COMPROBANTE / FALTA COTIZACION",
    "FALTA ORDEN / FALTA GUIA",
    "FALTA ORDEN / FALTA COTIZACION",
    "FALTA GUIA / FALTA COTIZACION",
    "FALTA COMPROBANTE / FALTA ORDEN / FALTA GUIA",
    "FALTA COMPROBANTE / FALTA ORDEN / FALTA COTIZACION",
    "FALTA COMPROBANTE / FALTA GUIA / FALTA COTIZACION",
    "FALTA ORDEN / FALTA GUIA / FALTA COTIZACION",
    "FALTA COMPROBANTE / FALTA ORDEN / FALTA GUIA / FALTA COTIZACION",
    "OK",
    "REGULARIZAR"
  ];


  return (
    <div className="facturas-layout">
      <Sidebar />
      <div className="facturas-container">
        <header className="facturas-header">
          <h1>Gestión de Ventas</h1>
          <p>Consulta, edita y administra tus Ventas de manera eficiente.</p>
        </header>
        <div className="table-container">
          <table className="facturas-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Nro Comprobante</th>
              <th>Estado</th>
              <th>Nro Orden</th>
              <th>Comprobante</th>
              <th>Orden Compra</th>
              <th>Guia</th>
              <th>Cotizacion</th>
              <th>Observacion</th>
              <th>Monto Comprobante</th>
              <th>Monto Detracción</th>
              <th>Saldo</th>
              <th>Fecha Abono</th>
              <th>Editar Fechas</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((venta, index) => (
              <tr key={index}>
                <td>{venta.fecha}</td>
                <td>{venta.nro_comprobante}</td>
                <td>{venta.estado}</td>
                <td>
                  <input
                    type="text"
                    value={venta.nro_ord_serv_nc || ""}
                    onChange={(e) => {
                      const nuevoOrdenServ = e.target.value;
                      setVentas(prevVentas =>
                        prevVentas.map(v =>
                          v.nro_comprobante === venta.nro_comprobante
                            ? { ...v, nro_ord_serv_nc: nuevoOrdenServ }
                            : v
                        )
                      );
                    }}
                    onBlur={(e) => handleUpdateOrdenServ(venta.nro_comprobante, e.target.value)}
                    className="editable-input"
                    style={{ width: "250px", textAlign: "center", height: "25px" }}
                  />
                </td>
                <td>
                  <button 
                    onClick={() => toggleEstado(venta.nro_comprobante, "comprobante_pago", venta.comprobante_pago)}
                    style={{ width: "15px", height: "25px" }}
                  >
                    {venta.comprobante_pago === true ? "✔" : venta.comprobante_pago === false ? "✖" : "-"}
                  </button>
                </td>
                <td>
                  <button 
                    onClick={() => toggleEstado(venta.nro_comprobante, "orden_serv_compr", venta.orden_serv_compr)}
                    style={{ width: "15px", height: "25px" }}
                  >
                    {venta.orden_serv_compr === true ? "✔" : venta.orden_serv_compr === false ? "✖" : "-"}
                  </button>
                </td>
                <td>
                  <button 
                    onClick={() => toggleEstado(venta.nro_comprobante, "guia", venta.guia)}
                    style={{ width: "15px", height: "25px" }}
                  >
                    {venta.guia === true ? "✔" : venta.guia === false ? "✖" : "-"}
                  </button>
                </td>
                <td>
                  <button 
                    onClick={() => toggleEstado(venta.nro_comprobante, "cotizacion", venta.cotizacion)}
                    style={{ width: "15px", height: "25px" }}
                  >
                    {venta.cotizacion === true ? "✔" : venta.cotizacion === false ? "✖" : "-"}
                  </button>
                </td>
                <td>
                  <input
                    type="text"
                    list="observaciones"
                    value={venta.observacion || ""}
                    onChange={(e) => handleUpdateObservacion(venta.nro_comprobante, e.target.value)}
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
                    value={formatCurrency(venta.monto_comprobante)}
                    onChange={(e) => handleInputChange(e, venta.nro_comprobante, "monto_comprobante")}
                    onBlur={() => handleBlur(venta.nro_comprobante, "monto_comprobante", venta.monto_comprobante)}
                    className="editable-input"
                    style={{ textAlign: "left" , width: "100px"}}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={formatCurrency(venta.monto_detraccion)}
                    onChange={(e) => handleInputChange(e, venta.nro_comprobante, "monto_detraccion")}
                    onBlur={() => handleBlur(venta.nro_comprobante, "monto_detraccion", venta.monto_detraccion)}
                    className="editable-input"
                    style={{ textAlign: "left", width: "100px" }}
                  />
                </td>
                <td>{formatCurrency(venta.saldo)}</td>
                <td className="border p-2">
                  {editando === venta.nro_comprobante ? (
                    <input
                      type="date"
                      value={fechas.fecha_abono}
                      onChange={(e) => setFechas({ ...fechas, fecha_abono: e.target.value })}
                      className="border p-1"
                    />
                  ) : (
                    venta.fecha_abono || "No registrada"
                  )}
                </td>
                <td className="border p-2">
                  {editando === venta.nro_comprobante ? (
                    <button
                      onClick={() => handleSave(venta.nro_comprobante)}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Guardar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEdit(venta)}
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

export default Ventas;
