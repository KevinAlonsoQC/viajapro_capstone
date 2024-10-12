export interface CentralColectivo {
    id: string;
    nombre_central: string;
    tarifa_diurna_central: number; // Opcional
    tarifa_nocturna_central: number; // Opcional
    img_central?: string; // Opcional
    comuna: string;  // Referencia a Comuna
    presidente?: string;
    estado: boolean;
}