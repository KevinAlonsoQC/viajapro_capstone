export interface Vehiculo {
    id: string;
    nombre_vehiculo: string;
    patente_vehiculo: string;
    cad_revision_tecnica_vehiculo: string;  // Fecha en formato ISO
    cad_per_circulacion_vehiculo: string;  // Fecha en formato ISO
    cad_soap_vehiculo: string;  // Fecha en formato ISO
    img_vehiculo?: string; // Opcional
    estado_vehiculo: string;
    asientos_dispo_vehiculo?: number; // Opcional
    coordenadas_vehiculo?: string; // Opcional
    usuario: string;  // Referencia a TipoUsuario
}