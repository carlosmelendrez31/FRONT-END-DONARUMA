export interface PerfumeOlfativo {
  idPerfume: number;
  nombre: string;
  marca: string;
  genero: string;
  ocasion: string;
  esDeNoche: boolean; // Este venía en tu API de .NET
  precio: number;
  descripcion: string;
  imagen_Url: string;
  stock: number;
  
  // Agregamos el signo de interrogación (?) porque estos 3 los creamos 
  // nosotros en Angular y no vienen directamente de la base de datos
  nombreMostrar?: string;
  imagenMostrar?: string;
  familiaOlfativa?: string;

  // ¡Agregamos esta nueva!
  familiasArray?: string[];
}