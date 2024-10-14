export interface Coordenada {
    x: number;
    y: number;
}

export interface RutaCentral {
    punto_1: Coordenada;
    punto_2: Coordenada;
    punto_3: Coordenada;
}

export interface RutaCentral {
    id: string;
    central: string;  // Referencia a CentralColectivo
    nombre_ruta: string;
    coordenada_ruta: RutaCentral;
}