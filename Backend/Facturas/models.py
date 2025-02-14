from sqlalchemy import Column, String, Float, DateTime, Boolean
from database import Base

class Facturas(Base):
    __tablename__ = "control_administrativo"  # Nombre de la tabla en la base de datos
    __table_args__ = {'schema': 'gmti'}
    nro_comprobante = Column(String, primary_key=True)
    fecha = Column(DateTime)
    clasificacion = Column(String)
    estado = Column(String)
    nro_ord_serv_nc = Column(String)
    nro_siaf = Column(String)
    ruc = Column(String)
    cliente = Column(String)
    descripcion = Column(String)
    sub_total = Column(Float)
    igv = Column(Float)
    importe_total = Column(Float)
    tipo = Column(String)
    comprobante_pago = Column(Boolean)
    comprobante_detraccion = Column(Boolean)
    informe = Column(Boolean)
    guia = Column(Boolean)
    orden_serv_compr = Column(Boolean)
    cotizacion = Column(Boolean)
    observacion = Column(String)
    monto_comprobante = Column(Float)
    monto_detraccion = Column(Float)
    saldo = Column(Float)
    banco = Column(String)
    fecha_abono = Column(DateTime)
    fecha_detraccion = Column(DateTime)
    fecha_nota_credito = Column(DateTime)
    file = Column(String)
