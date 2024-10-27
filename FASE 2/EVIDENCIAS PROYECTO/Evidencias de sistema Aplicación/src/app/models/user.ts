export interface User {
    uid: string;
    name: string;
    rut_usuario: string;
    email: string;
    password: string;
    telefono_usuario: number; // Opcional
    img_usuario?: string; // Opcional
    coordenadas_usuario?: string; // Opcional
    tipo_usuario: string;  // Referencia a TipoUsuario
    pais: string;  // Referencia a Pais
    central: string;

    en_ruta?: boolean;
    vehiculo_actual?: string;
}

