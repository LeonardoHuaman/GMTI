import React, { useState } from "react";
import { Button, Box, Typography } from "@mui/material";

const Upload = ({ onSuccessUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setErrorMessage(""); // Limpiar errores previos
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Por favor, selecciona un archivo XML.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:8001/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("✅ Respuesta del servidor:", result);

      if (result.status === "success") {
        onSuccessUpload(result.data); // Pasar los datos extraídos
      } else {
        setErrorMessage("Error al procesar el archivo: " + result.message);
      }
    } catch (error) {
      console.error("❌ Error al enviar el archivo:", error);
      setErrorMessage("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Typography variant="h6">Subir Archivo XML</Typography>

      <input type="file" accept=".xml" onChange={handleFileChange} />
      {selectedFile && <Typography variant="body1">Archivo: {selectedFile.name}</Typography>}

      {errorMessage && <Typography color="error">{errorMessage}</Typography>}

      <Button
        variant="contained"
        color="primary"
        onClick={handleFileUpload}
        disabled={loading}
      >
        {loading ? "Procesando..." : "Procesar Archivo"}
      </Button>
    </Box>
  );
};

export default Upload;
