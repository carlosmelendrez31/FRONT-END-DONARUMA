export interface PerfumeOlfativo {
  // Datos base de tu API
  idPerfume?: number;
  nombre?: string;
  marca?: string;
  precio?: number;
  descripcion?: string;
  imagen_Url?: string;
  ocasion?: string;
  genero?: string;
  stock?: number;

  // Las estadísticas de tu nueva API
  intensidad?: number;
  dulzor?: number;
  duracion?: number;
  aromatico?: number;

  // El arreglo de números que manda la nueva API para las familias
  familiasOlfativasIds?: number[];

  // Variables extra calculadas que usa nuestro diseño visual (Front-end)
  imagenMostrar?: string;
  nombreMostrar?: string;
  familiasArray?: string[];
  familiaOlfativa?: string;
  img1?: string;
  img2?: string;
}