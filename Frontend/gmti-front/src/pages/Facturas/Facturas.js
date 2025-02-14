import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./Facturas.css";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Upload from "../../components/Upload";
import ModalFactura from "../../components/ModalFactura";
import { Button, Modal, Box } from "@mui/material";
import { MdDangerous, MdDelete } from "react-icons/md";
import ModalAnulados from "../../components/ModalAnulados";

const Facturas = () => {
  const navigate = useNavigate();
  const [facturas, setFacturas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModalUpload, setOpenModalUpload] = useState(false);
  const [openModalFactura, setOpenModalFactura] = useState(false);
  const [facturaData, setFacturaData] = useState(null);
  const itemsPerPage = 15;
  const token = useMemo(() => localStorage.getItem("token"), []);
  const formatCurrency = (value) => 
    new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(value);
  const [openModalAnulados, setOpenModalAnulados] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  


  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (!token) {
          navigate("/");
          return;
        }
        const response = await fetch(`http://localhost:8000/verify-token/${token}`);
        if (!response.ok) throw new Error("Token verification failed");
      } catch (error) {
        console.error("Error verificando token:", error);
        localStorage.removeItem("token");
        navigate("/");
      }
    };
    verifyToken();
  }, [navigate, token]);
  

  const fetchFacturas = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://127.0.0.1:8001/facturas");
      if (!response.ok) throw new Error("No se pudieron obtener las facturas.");
      const data = await response.json();
      setFacturas(data);
    } catch (error) {
      console.error("Error al obtener facturas:", error);
      setError("Error al cargar las facturas.");
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchFacturas();
  }, [fetchFacturas]);
  

  const totalPages = useMemo(() => Math.ceil(facturas.length / itemsPerPage), [facturas.length, itemsPerPage]);

  const currentItems = useMemo(() => facturas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [facturas, currentPage, itemsPerPage]);

  const handleChangePage = useCallback((event, value) => {
    setCurrentPage(value);
  }, []);

  const handleSuccessUpload = (data) => {
    setFacturaData(data); // Guarda los datos extraídos del XML
    setOpenModalUpload(false); // Cierra el modal de Upload
    setOpenModalFactura(true); // Abre el modal de Factura
  };

  const handleDeleteFactura = async (nroComprobante) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta factura?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://127.0.0.1:8001/facturas/${nroComprobante}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar la factura.");

      setFacturas((prevFacturas) => prevFacturas.filter((factura) => factura.nro_comprobante !== nroComprobante));
    } catch (error) {
      console.error("Error eliminando factura:", error);
      alert("No se pudo eliminar la factura.");
    }
  };

  return (
    <div className="facturas-layout">
      <Sidebar />
      <div className="facturas-container">
        <header className="facturas-header">
          <h1>Gestión de Facturas</h1>
        </header>
        
        <Button variant="contained" color="primary" onClick={() => setOpenModalUpload(true)}>
          Subir Archivo
        </Button>

        {/* Tabla de Facturas */}
        {loading ? (  
          <p>Cargando facturas...</p>  
        ) : error ? (  
          <p className="error-message">{error}</p>  
        ) : facturas.length === 0 ? (  
          <p>No hay facturas disponibles.</p>  
        ) : (  
          <>  
            <table className="facturas-table">  
              <thead>  
                <tr>  
                  <th>Fecha</th>  
                  <th>Nro Comprobante</th>  
                  <th>Estado</th>  
                  <th>Tipo</th>  
                  <th>RUC</th>  
                  <th>Cliente</th>  
                  <th>Descripción</th>  
                  <th>Sub Total</th>  
                  <th>IGV</th>  
                  <th>Total</th>
                  <th>Acciones</th>   
                </tr>  
              </thead>  
              <tbody>  
                {currentItems.map((factura) => (  
                  <tr key={factura.id || factura.nro_comprobante}>  
                    <td>{factura.fecha}</td>  
                    <td>{factura.nro_comprobante}</td>  
                    <td>{factura.estado}</td>  
                    <td>{factura.tipo}</td>  
                    <td>{factura.ruc}</td>  
                    <td>{factura.cliente}</td>  
                    <td>{factura.descripcion}</td>  
                    <td>{formatCurrency(factura.sub_total || 0)}</td>  
                    <td>{formatCurrency(factura.igv || 0)}</td>  
                    <td>{formatCurrency(factura.importe_total || 0)}</td>
                    <td>
                      <button 
                        style={{ backgroundColor: "#e37d17", border: "none", padding: "5px", marginRight: "5px" }} 
                        onClick={() => {
                          setFacturaSeleccionada(factura); // Guarda los datos de la factura seleccionada
                          setOpenModalAnulados(true); // Abre el modal de anulados
                        }}
                      >
                        <MdDangerous size={20} color="#fff" />
                      </button>

                      <button onClick={() => handleDeleteFactura(factura.nro_comprobante)} style={{ backgroundColor: "#ad1c2a", border: "none", padding: "5px" }}>
                        <MdDelete size={20} color="#fff" />
                      </button>
                    </td>  
                  </tr>  
                ))}  
              </tbody>  
            </table>  
          </>  
        )}  

        {/* Paginación */}
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Pagination count={totalPages} page={currentPage} onChange={handleChangePage} />
        </Stack>

      </div>

      {/* Modal de Upload */}
      <Modal open={openModalUpload} onClose={() => setOpenModalUpload(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 555, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2 }}>
          <Upload onSuccessUpload={handleSuccessUpload} onClose={() => setOpenModalUpload(false)} />
        </Box>
      </Modal>

      {/* Modal de Factura */}
      {facturaData && (
        <Modal open={openModalFactura} onClose={() => setOpenModalFactura(false)}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 460, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2 }}>
            <ModalFactura data={facturaData} onClose={() => setOpenModalFactura(false)} />
          </Box>
        </Modal>
      )}

      {/* Modal de Anulados */}
      {facturaSeleccionada && (
        <Modal open={openModalAnulados} onClose={() => setOpenModalAnulados(false)}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 460, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2 }}>
            <ModalAnulados data={facturaSeleccionada} onClose={() => setOpenModalAnulados(false)} />
          </Box>
        </Modal>
      )}
    </div>
  );
};

export default Facturas;
