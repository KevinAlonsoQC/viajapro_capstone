export interface HistorialPago {
    id: string;
    id_transaccion: string;
    fecha_pago: string;
    monto_pago: number;
    chofer: string; // Referencia a un documento de la colección 'usuario'
    cliente: string; // Referencia a un documento de la colección 'usuario'
    central: string; // Referencia a un documento de la colección 'central_colectivo'
    vehiculo: string; // Referencia a un documento de la colección 'vehiculo'
    tipo_pago: string; // Referencia a un documento de la colección 'tipo_pago'
}
