export interface PerfumeOlfativo {
  idPerfume: number;
  nombre: string;
  marca: string;
  genero: string;
  ocasion: string;
  // Este venía en tu API de .NET
  esDeNoche: boolean;
  precio: number;
  descripcion: string;
  imagen_Url: string;
  stock: number;
  
  // Agregamos el signo de interrogación (?) porque estos 3 los creamos 
  // nosotros en Angular y no vienen directamente de la base de datos
  nombreMostrar?: string;
  imagenMostrar?: string;
  familiaOlfativa?: string;

  // ¡ESTOS SON LOS NUEVOS PARA EL MODAL PREMIUM! 👇
  img1?: string;
  img2?: string;
  aromatico?: number;
  intensidad?: number;
  dulzor?: number;
  duracion?: number;
  
  // ¡Agregamos esta nueva!
  familiasArray?: string[];
}