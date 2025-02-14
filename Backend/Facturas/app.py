from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from models import Facturas
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import desc
import xml.etree.ElementTree as ET
import pandas as pd
import io
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Permitir solo este origen
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permitir todos los encabezados
)

@app.get("/")
async def root():
    return {"message": "Bienvenido a mi API de FACTURAS"}

namespaces = {
    'cbc': "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
    'cac': "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
    'ext': "urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
}

def obtener_texto(elemento, etiqueta, ns):
    """ Función para obtener texto de un nodo XML """
    tag = f"{{{ns}}}{etiqueta}"
    nodo = elemento.find(tag)
    return nodo.text if nodo is not None else None

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Leer archivo en memoria
        contents = await file.read()
        tree = ET.parse(io.BytesIO(contents))
        root = tree.getroot()

        # Extraer información relevante
        invoice_id = obtener_texto(root, "ID", namespaces['cbc'])
        issue_date = obtener_texto(root, "IssueDate", namespaces['cbc'])

        customer = root.find("cac:AccountingCustomerParty", namespaces)
        customer_party = customer.find("cac:Party", namespaces)
        customer_id = customer_party.find("cac:PartyIdentification/cbc:ID", namespaces)
        customer_name = customer_party.find("cac:PartyLegalEntity/cbc:RegistrationName", namespaces)

        invoice_line = root.find("cac:InvoiceLine", namespaces)
        item_description = invoice_line.find("cac:Item/cbc:Description", namespaces)
        line_extension_amount = invoice_line.find("cbc:LineExtensionAmount", namespaces)

        tax_total = root.find("cac:TaxTotal", namespaces)
        tax_amount = tax_total.find("cbc:TaxAmount", namespaces)

        legal_monetary_total = root.find("cac:LegalMonetaryTotal", namespaces)
        payable_amount = legal_monetary_total.find("cbc:PayableAmount", namespaces)

        # Construir respuesta JSON con los datos extraídos
        data = {
            "fecha": issue_date,
            "nro_comprobante": invoice_id,
            "ruc": customer_id.text if customer_id is not None else "No disponible",
            "cliente": customer_name.text if customer_name is not None else "No disponible",
            "descripcion": item_description.text if item_description is not None else "No disponible",
            "sub_total": line_extension_amount.text if line_extension_amount is not None else "No disponible",
            "igv": tax_amount.text if tax_amount is not None else "No disponible",
            "importe_total": payable_amount.text if payable_amount is not None else "No disponible",
        }

        return {"status": "success", "data": data}

    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/facturas")
def read_all_invoices(db: Session = Depends(get_db)):
    """
    Retorna todas las facturas ordenadas de la fecha más reciente a la más antigua.
    """
    return db.query(Facturas).order_by(desc(Facturas.fecha)).all()

@app.get("/facturas/{nro_comprobante}")
def read_invoice(nro_comprobante: str, db: Session = Depends(get_db)):
    """
    Retorna un registro específico según el número de comprobante.
    """
    invoice = db.query(Facturas).filter(Facturas.nro_comprobante == nro_comprobante).first()
    if invoice is None:
        raise HTTPException(status_code=404, detail="No se encontró el comprobante.")
    return invoice

class FacturaCreate(BaseModel):
    nro_comprobante: str
    fecha: datetime
    clasificacion: str
    estado: str
    nro_ord_serv_nc: str | None = None
    nro_siaf: str | None = None
    ruc: str
    cliente: str
    descripcion: str
    sub_total: float
    igv: float
    importe_total: float
    tipo: str
    comprobante_pago: bool | None = None
    comprobante_detraccion: bool | None = None
    informe: bool | None = None
    guia: bool | None = None
    orden_serv_compr: bool | None = None
    cotizacion: bool | None = None
    observacion: str | None = None
    monto_comprobante: float | None = None
    monto_detraccion: float | None = None
    saldo: float | None = None
    banco: str | None = None
    fecha_abono: datetime | None = None
    fecha_detraccion: datetime | None = None
    fecha_nota_credito: datetime | None = None
    file: str | None = None

@app.post("/facturas")
def create_factura(factura: FacturaCreate, db: Session = Depends(get_db)):
    """
    Crea una nueva factura en la base de datos.
    """
    # Verificar si ya existe una factura con el mismo número de comprobante
    existing_factura = db.query(Facturas).filter(Facturas.nro_comprobante == factura.nro_comprobante).first()
    if existing_factura:
        raise HTTPException(status_code=400, detail="La factura con este número de comprobante ya existe")

    nueva_factura = Facturas(**factura.dict())

    db.add(nueva_factura)
    db.commit()
    db.refresh(nueva_factura)

    return {"message": "Factura creada exitosamente", "factura": nueva_factura}

@app.delete("/facturas/{nro_comprobante}")
def delete_factura(nro_comprobante: str, db: Session = Depends(get_db)):
    """
    Elimina una factura de la base de datos según su número de comprobante.
    """
    factura = db.query(Facturas).filter(Facturas.nro_comprobante == nro_comprobante).first()
    
    if factura is None:
        raise HTTPException(status_code=404, detail="Factura no encontrada")

    db.delete(factura)
    db.commit()
    
    return {"message": f"Factura {nro_comprobante} eliminada exitosamente"}


class FacturaUpdate(BaseModel):
    clasificacion: Optional[str] = None
    estado: Optional[str] = None
    nro_ord_serv_nc: Optional[str] = None
    nro_siaf: Optional[str] = None
    cliente: Optional[str] = None
    descripcion: Optional[str] = None
    sub_total: Optional[float] = None
    igv: Optional[float] = None
    importe_total: Optional[float] = None
    tipo: Optional[str] = None
    comprobante_pago: Optional[bool] = None
    comprobante_detraccion: Optional[bool] = None
    informe: Optional[bool] = None
    guia: Optional[bool] = None
    orden_serv_compr: Optional[bool] = None
    cotizacion: Optional[bool] = None
    observacion: Optional[str] = None
    monto_comprobante: Optional[float] = None
    monto_detraccion: Optional[float] = None
    saldo: Optional[float] = None
    banco: Optional[str] = None
    fecha_abono: Optional[datetime] = None
    fecha_detraccion: Optional[datetime] = None
    fecha_nota_credito: Optional[datetime] = None
    file: Optional[str] = None

@app.patch("/facturas/{nro_comprobante}")
def update_factura(nro_comprobante: str, factura_data: FacturaUpdate, db: Session = Depends(get_db)):
    """
    Actualiza parcialmente una factura en la base de datos.
    Solo los campos proporcionados en la solicitud serán actualizados.
    """
    factura = db.query(Facturas).filter(Facturas.nro_comprobante == nro_comprobante).first()

    if not factura:
        raise HTTPException(status_code=404, detail="Factura no encontrada")

    # Actualizar solo los campos proporcionados en la solicitud
    update_data = factura_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(factura, key, value)

    db.commit()
    db.refresh(factura)

    return {"message": "Factura actualizada exitosamente", "factura": factura}

@app.get("/servicios")
def get_servicios(db: Session = Depends(get_db)):
    """
    Retorna todas las facturas donde la clasificación es 'SERVICIO' 
    y el estado no es 'ANULADO', ordenadas de la más reciente a la más antigua.
    """
    servicios = db.query(Facturas).filter(
        Facturas.clasificacion == "SERVICIO",
        Facturas.estado != "ANULADO"
    ).order_by(desc(Facturas.fecha)).all()

    return servicios

@app.get("/ventas")
def get_ventas(db: Session = Depends(get_db)):
    ventas = db.query(Facturas).filter(
        Facturas.clasificacion == "VENTA",
        Facturas.estado != "ANULADO"
    ).order_by(desc(Facturas.fecha)).all()

    return ventas

@app.get("/anulados")
def get_anulados(db: Session = Depends(get_db)):
    anulados = db.query(Facturas).filter(
        Facturas.estado == "ANULADO"
    ).order_by(desc(Facturas.fecha)).all()

    return anulados