import React, { useState } from "react";
import axios from "axios";
import "./ModalFactura.css"; // Reutilizando estilos

const ModalAnulados = ({ data, onClose }) => {
  // Estados para los nuevos campos
  const [nroNotaCredito, setNroNotaCredito] = useState("E001-");
  const [observacion, setObservacion] = useState("ADJUNTAR NOTA DE CRÉDITO");

  // Inicializar la fecha en formato inglés (YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];
  const [fechaNotaCredito, setFechaNotaCredito] = useState(today);

  if (!data) return null;

  // Función para anular la factura
  const handleAnular = async () => {
    try {
      const updatedFactura = {
        estado: "ANULADO",
        nro_ord_serv_nc: nroNotaCredito,
        fecha_nota_credito: fechaNotaCredito,
        observacion: observacion,
        sub_total: 0,
        igv: 0,
        importe_total: 0,
        nro_siaf: null,
        comprobante_pago: null,
        comprobante_detraccion: null,
        informe: null,
        guia: null,
        orden_serv_compr: null,
        cotizacion: null,
        monto_comprobante: null,
        monto_detraccion: null,
        saldo: null,
        banco: null,
        fecha_abono: null,
        fecha_detraccion: null,
      };

      const response = await axios.patch(
        `http://localhost:8001/facturas/${data.nro_comprobante}`,
        updatedFactura
      );

      console.log(response.data);
      alert("Factura anulada exitosamente");
      onClose(); // Cerrar el modal después de la actualización
    } catch (error) {
      console.error("Error al anular la factura:", error);
      alert("Hubo un error al anular la factura.");
    }
  };

  return (
    <div className="modal-container">
      <div className="modal-content">
        <h2>Factura Anulada</h2>
        <form className="modal-form">
          <div className="form-group">
            <label>Fecha</label>
            <input type="text" name="fecha" value={data.fecha || ""} readOnly />
          </div>
          <div className="form-group">
            <label>Nro Comprobante</label>
            <input type="text" name="nro_comprobante" value={data.nro_comprobante || ""} readOnly />
          </div>
          <div className="form-group">
            <label>RUC</label>
            <input type="text" name="ruc" value={data.ruc || ""} readOnly />
          </div>
          <div className="form-group">
            <label>Cliente</label>
            <input type="text" name="cliente" value={data.cliente || ""} readOnly />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea name="descripcion" value={data.descripcion || ""} readOnly />
          </div>

          {/* Nro Nota de Crédito */}
          <div className="form-group">
            <label>Nro Nota de Crédito</label>
            <input
              type="text"
              name="nro_nota_credito"
              value={nroNotaCredito}
              onChange={(e) => setNroNotaCredito(e.target.value)}
            />
          </div>

          {/* Observación (Select) */}
          <div className="form-group">
            <label>Observación</label>
            <select
              name="observacion"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
            >
              <option value="ADJUNTAR NOTA DE CRÉDITO">ADJUNTAR NOTA DE CRÉDITO</option>
              <option value="OK">OK</option>
            </select>
          </div>

          {/* Fecha Nota de Crédito en formato inglés */}
          <div className="form-group">
            <label>Fecha Nota de Crédito</label>
            <input
              type="date"
              name="fecha_nota_credito"
              value={fechaNotaCredito}
              onChange={(e) => setFechaNotaCredito(e.target.value)}
            />
          </div>
        </form>

        <div className="modal-buttons">
          <button className="close-button" onClick={onClose}>Cerrar</button>
          <button
            className="upload-button"
            onClick={handleAnular}
            disabled={!nroNotaCredito || !fechaNotaCredito}
          >
            Anular
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAnulados;
