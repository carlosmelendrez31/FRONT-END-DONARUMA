// Exportamos la interfaz que coincide con tu API de Perfumes
export interface PerfumeAPI {
  idPerfume: number;
  nombre: string;
  marca: string;
  precio: number;
  descripcion: string;
  imagen_Url: string;
  ocasion: string;
  genero: string;
  stock: number;
  intensidad: number;
  dulzor: number;
  duracion: number;
  aromatico: number;
  familiasOlfativasIds: number[];
}

// Interfaz para la tabla de administración de ofertas
export interface OfertaItem {
  idTemporal?: number; // Opcional, para uso en memoria
  idPerfume: number;   // Relacionamos la oferta con el ID real del perfume
  perfume: PerfumeAPI; // Guardamos el objeto completo para mostrar foto, nombre, etc.
  descuento: number;
  precioOferta: number;
  activo: boolean;
}

// reloj de ofertas
export interface ConfiguracionReloj {
  fechaFinOferta: string;
}