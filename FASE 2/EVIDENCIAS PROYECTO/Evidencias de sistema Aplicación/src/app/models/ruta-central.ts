export interface RutaCentral {
    id: string;
    central: string;  // Referencia a CentralColectivo
    nombre_ruta: string;
    coordenada_ruta: any;
    estado: boolean;
    punto_inicio: any;
    punto_final: any;
    tarifa_diurna: number;
    tarifa_nocturna: number;
}