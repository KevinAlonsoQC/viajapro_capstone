export interface MarcaVehiculo {
    id: string;
    nombre_marca: string;
    img_marca?: string; // Opcional
    estado: boolean;
}

export interface ModeloVehiculo {
  id: string;
  nombre_modelo: string;
  img_modelo?: string; // Opcional
  id_marca: string; //estará afiliado a una marca
  estado: boolean;

}