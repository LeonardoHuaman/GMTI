import React, { useState, useEffect } from "react";
import "./ModalFactura.css";

const ModalFactura = ({ data, onClose }) => {
  const [formData, setFormData] = useState({
    nro_comprobante: "",
    fecha: "",
    clasificacion: "VENTA",
    estado: "POR COBRAR",
    nro_ord_serv_nc: null,
    nro_siaf: null,
    ruc: "",
    cliente: "",
    descripcion: "",
    sub_total: "",
    igv: "",
    importe_total: "",
    tipo: "",
    comprobante_pago: null,
    comprobante_detraccion: null,
    informe: null,
    guia: null,
    orden_serv_compr: null,
    cotizacion: null,
    observacion: null,
    monto_comprobante: null,
    monto_detraccion: null,
    saldo: null,
    banco: null,
    fecha_abono: null,
    fecha_detraccion: null,
    fecha_nota_credito: null,
    file: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData((prevData) => ({
        ...prevData,
        nro_comprobante: data.nro_comprobante || "",
        fecha: data.fecha || "",
        ruc: data.ruc || "",
        cliente: data.cliente || "",
        descripcion: data.descripcion || "",
        sub_total: data.sub_total || "",
        igv: data.igv || "",
        importe_total: data.importe_total || "",
        tipo: "",
        file: "",
      }));
    }
  }, [data]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "tipo" ? value.toUpperCase() : value,
    }));
  };

  const isFormValid = formData.nro_comprobante.trim() !== "" && formData.fecha.trim() !== "";

  const formatDataForBackend = () => {
    return Object.fromEntries(
      Object.entries(formData).map(([key, value]) => {
        if (typeof value === "string" && value.trim() === "") return [key, null];
        if (["sub_total", "igv", "importe_total", "monto_comprobante", "monto_detraccion", "saldo"].includes(key)) {
          return [key, value ? parseFloat(value) : null];
        }
        if (["fecha", "fecha_abono", "fecha_detraccion", "fecha_nota_credito"].includes(key)) {
          return [key, value ? new Date(value).toISOString() : null];
        }
        return [key, value];
      })
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const formattedData = formatDataForBackend();

    try {
      const response = await fetch("http://localhost:8001/facturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error("Error al subir la factura");
      }

      alert("Factura subida con éxito");
      onClose();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-container">
      <div className="modal-content">
        <h2>Datos de la Factura</h2>
        <form className="modal-form">
          <div className="form-group">
            <label>Nro Comprobante</label>
            <input type="text" name="nro_comprobante" value={formData.nro_comprobante} readOnly />
          </div>
          <div className="form-group">
            <label>Fecha</label>
            <input type="date" name="fecha" value={formData.fecha} readOnly />
          </div>
          <div className="form-group">
            <label>RUC</label>
            <input type="text" name="ruc" value={formData.ruc} readOnly />
          </div>
          <div className="form-group">
            <label>Cliente</label>
            <input type="text" name="cliente" value={formData.cliente} readOnly />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea name="descripcion" value={formData.descripcion} readOnly />
          </div>
          <div className="form-group">
            <label>Subtotal</label>
            <input type="text" name="sub_total" value={formData.sub_total} readOnly />
          </div>
          <div className="form-group">
            <label>IGV</label>
            <input type="text" name="igv" value={formData.igv} readOnly />
          </div>
          <div className="form-group">
            <label>Importe Total</label>
            <input type="text" name="importe_total" value={formData.importe_total} readOnly />
          </div>
          <div className="form-group">
            <label>Tipo</label>
            <input type="text" name="tipo" value={formData.tipo} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>File</label>
            <input type="text" name="file" value={formData.file} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Estado</label>
            <select name="estado" value={formData.estado} onChange={handleInputChange}>
              <option value="POR COBRAR">POR COBRAR</option>
              <option value="COBRADO">COBRADO</option>
            </select>
          </div>
          <div className="form-group">
            <label>Clasificación</label>
            <select name="clasificacion" value={formData.clasificacion} onChange={handleInputChange}>
              <option value="VENTA">VENTA</option>
              <option value="SERVICIO">SERVICIO</option>
            </select>
          </div>
        </form>
        <div className="modal-buttons">
          <button className="upload-button" disabled={!isFormValid || isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? "Subiendo..." : "Subir"}
          </button>
          <button className="close-button" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalFactura;
