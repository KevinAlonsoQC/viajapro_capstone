export interface HistorialPago {
    id: string;
    id_transaccion: string;
    fecha_pago: string;
    monto_pago: number;

    chofer: string; // Referencia a un documento de la colección 'usuario' ESTOS USAN UID Y TIPO DE CUENTA 2 ES CHOFER
    cliente: string; // Referencia a un documento de la colección 'usuario' ESTOS USAN UID Y TIPO DE CUENTA 3 ES PASAJERO

    central: string; // Referencia a un documento de la colección 'central_colectivo' USA ID
    vehiculo: string; // Referencia a un documento de la colección 'vehiculo' USA ID
    
    tipo_pago: string; // Referencia a un documento de la colección 'tipo_pago'
}
 //nombre de Colección en FireBase: historial_pago