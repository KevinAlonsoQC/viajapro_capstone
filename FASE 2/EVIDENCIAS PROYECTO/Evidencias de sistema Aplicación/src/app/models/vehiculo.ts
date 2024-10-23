export interface Vehiculo {
    id?: string;
    nombre_modelo: string;
    patente_vehiculo: string;
    cad_revision_tecnica_vehiculo: string;  // Fecha en formato ISO
    cad_per_circulacion_vehiculo: string;  // Fecha en formato ISO
    cad_soap_vehiculo: string;  // Fecha en formato ISO
    img_vehiculo?: string; // Opcional
    asientos_dispo_vehiculo?: number; // Opcional
    coordenadas_vehiculo?: string; // Opcional
    usuario?: [];  // Cadena de los usuarios que manejan este vehículo
    central: string;

    marca: string;
    modelo: string;
}