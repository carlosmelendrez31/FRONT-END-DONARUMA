import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfumeService } from '../../../../core/services/perfume';

@Component({
  selector: 'app-agregarperfume',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agregarperfume.html',
  styleUrl: './agregarperfume.css',
})
export class Agregarperfume implements OnInit {

  listaPerfumes: any[] = [];
  textoBusqueda: string = '';
  mostrarModal: boolean = false;
  mostrarAlerta: boolean = false;
  mensajeAlerta: string = '';
  tipoAlerta: 'success' | 'error' | 'warning' = 'success';
  
  // --- VARIABLES PARA MENÚS DESPLEGABLES ---
  dropdownGeneroAbierto: boolean = false;
  dropdownFamiliaAbierto: boolean = false;
  dropdownOcasionAbierto: boolean = false;

  mostrarConfirmacionEliminar: boolean = false;
  perfumeAEliminar: any = null;

  nuevoPerfume: any = this.limpiarDatos();

  // --- VARIABLES DE FAMILIAS ACTUALIZADAS (CON IDs) ---
  listaFamilias: any[] = [
    { id: 1, nombre: '🍋 Cítricos' },
    { id: 2, nombre: '🌹 Florales' }, // Usamos el 2 (puedes borrar el 3 en tu BD después)
    { id: 4, nombre: '🌙 Orientales' },
    { id: 5, nombre: '🍓 Frutales' },
    { id: 6, nombre: '🍦 Gourmand' },
    { id: 7, nombre: '🌿 Herbales' },
    { id: 8, nombre: '🍃 Fougère' },
    { id: 9, nombre: '🌊 Acuáticos' }
  ];
  
  // 🔥 AHORA GUARDA OBJETOS COMPLETOS, NO SOLO STRINGS 🔥
  familiasSeleccionadas: any[] = [];

  constructor(private perfumeService: PerfumeService) { }

  ngOnInit(): void {
    this.cargarPerfumes();
  }

  lanzarAlerta(mensaje: string, tipo: 'success' | 'error' | 'warning') {
    this.mensajeAlerta = mensaje;
    this.tipoAlerta = tipo;
    this.mostrarAlerta = true;
    setTimeout(() => { this.mostrarAlerta = false; }, 3000);
  }

  // --- FUNCIÓN: VALIDAR STOCK (No dejar bajar de 1) ---
  validarStock() {
    if (this.nuevoPerfume.stock !== null && this.nuevoPerfume.stock < 1) {
      this.nuevoPerfume.stock = 1;
      this.lanzarAlerta('El stock mínimo debe ser 1', 'warning');
    }
  }

  // --- NUEVAS FUNCIONES PARA MANEJAR LOS IDs DE LAS FAMILIAS ---
  get familiasSeleccionadasNombres() {
    return this.familiasSeleccionadas.map(f => f.nombre).join(', ');
  }

  esFamiliaSeleccionada(id: number) {
    return this.familiasSeleccionadas.some(f => f.id === id);
  }

  // --- FUNCIÓN: SELECCIONAR FAMILIA ACTUALIZADA ---
  toggleFamilia(familia: any) {
    const index = this.familiasSeleccionadas.findIndex(f => f.id === familia.id);
    if (index > -1) {
      this.familiasSeleccionadas.splice(index, 1);
    } else if (this.familiasSeleccionadas.length < 3) {
      this.familiasSeleccionadas.push(familia);
    } else {
      this.lanzarAlerta('Máximo 3 familias permitidas', 'warning');
    }
  }

  get perfumesFiltrados() {
    if (!this.textoBusqueda) return this.listaPerfumes;
    return this.listaPerfumes.filter(p => {
      const nombre = (p.nombre || p.Nombre || '').toLowerCase();
      const marca = (p.marca || p.Marca || '').toLowerCase();
      return nombre.includes(this.textoBusqueda.toLowerCase()) || marca.includes(this.textoBusqueda.toLowerCase());
    });
  }

  cargarPerfumes() {
    this.perfumeService.obtenerTodos().subscribe({
      next: (datos: any[]) => {
        this.listaPerfumes = datos.map(p => {
          return {
            idPerfume: p.idperfume || p.idPerfume || p.IdPerfume,
            nombre: p.nombre || p.Nombre, 
            marca: p.marca || p.Marca,
            precio: p.precio || p.Precio,
            descripcion: p.descripcion || p.Descripcion,
            imagen_Url: p.imagen_url || p.imagen_Url || p.Imagen_Url,
            stock: p.stock || p.Stock,
            genero: p.genero || p.Genero,
            ocasion: p.ocasion || p.Ocasion,
            // Asegurarse de recibir el arreglo de IDs de la base de datos
            familiasOlfativasIds: p.familiasOlfativasIds || p.FamiliasOlfativasIds || [],
            intensidad: p.intensidad ?? 50,
            dulzor: p.dulzor ?? 50,
            duracion: p.duracion ?? 50,
            aromatico: p.aromatico ?? 50
          };
        });
      },
      error: () => this.lanzarAlerta('Error al cargar datos', 'error')
    });
  }

  guardarPerfume() {
    if (!this.nuevoPerfume.nombre || !this.nuevoPerfume.marca || !this.nuevoPerfume.precio) {
      this.lanzarAlerta('Faltan campos obligatorios', 'warning');
      return;
    }

    // Empaquetamos todo EXACTO para el C#
    const perfumeAEnviar = {
      IdPerfume: this.nuevoPerfume.idPerfume || 0,
      Nombre: this.nuevoPerfume.nombre,
      Marca: this.nuevoPerfume.marca,
      Precio: this.nuevoPerfume.precio,
      Descripcion: this.nuevoPerfume.descripcion || '',
      Imagen_Url: this.nuevoPerfume.imagen_Url || '',
      Stock: this.nuevoPerfume.stock || 0,
      Genero: this.nuevoPerfume.genero || 'Hombre',
      Ocasion: this.nuevoPerfume.ocasion || 'Día',
      
      // 🔥 AQUÍ SE MANDAN LOS IDs AL BACK-END 🔥
      FamiliasOlfativasIds: this.familiasSeleccionadas.map(f => f.id),
      
      Intensidad: this.nuevoPerfume.intensidad,
      Dulzor: this.nuevoPerfume.dulzor,
      Duracion: this.nuevoPerfume.duracion,
      Aromatico: this.nuevoPerfume.aromatico
    };

    const id = perfumeAEnviar.IdPerfume;

    if (id && id !== 0) {
      this.perfumeService.actualizarPerfume(id, perfumeAEnviar).subscribe({
        next: () => {
          this.lanzarAlerta('Guardado exitosamente', 'success');
          this.recargar();
        },
        error: () => this.lanzarAlerta('Error al guardar en el servidor', 'error')
      });
    } else {
      this.perfumeService.crearPerfume(perfumeAEnviar).subscribe({
        next: () => {
          this.lanzarAlerta('Creado exitosamente', 'success');
          this.recargar();
        },
        error: () => this.lanzarAlerta('Error al crear el perfume', 'error')
      });
    }
  }

  editarPerfume(p: any) {
    this.nuevoPerfume = { ...p };
    
    // Encendemos los botoncitos leyendo los IDs que mandó el C#
    const ids = p.familiasOlfativasIds || [];
    
    if (ids.length > 0) {
      this.familiasSeleccionadas = this.listaFamilias.filter(f => ids.includes(f.id));
    } else {
      this.familiasSeleccionadas = [];
    }

    this.mostrarModal = true;
  }

  abrirConfirmacionEliminar(p: any) {
    this.perfumeAEliminar = p;
    this.mostrarConfirmacionEliminar = true;
  }

  cancelarEliminacion() {
    this.mostrarConfirmacionEliminar = false;
    this.perfumeAEliminar = null;
  }

  ejecutarEliminacion() {
    if (!this.perfumeAEliminar) return;
    const id = this.perfumeAEliminar.idPerfume;
    
    this.perfumeService.eliminarPerfume(id).subscribe({
      next: () => {
        this.lanzarAlerta('Eliminado exitosamente', 'success');
        this.cargarPerfumes();
        this.mostrarConfirmacionEliminar = false;
        this.perfumeAEliminar = null;
      },
      error: () => {
        this.lanzarAlerta('No se puede eliminar: Tiene ventas registradas', 'error');
        this.mostrarConfirmacionEliminar = false;
      }
    });
  }

  abrirModal() { this.nuevoPerfume = this.limpiarDatos(); this.mostrarModal = true; }
  cerrarModal() { this.mostrarModal = false; }
  recargar() { this.cargarPerfumes(); this.cerrarModal(); }

  limpiarDatos() {
    this.familiasSeleccionadas = []; 
    
    return {
      nombre: '', marca: '', genero: 'Hombre', ocasion: 'Día',
      precio: null, stock: null, descripcion: '', imagen_Url: '',
      intensidad: 50, dulzor: 50, duracion: 50, aromatico: 50
    };
  }

  // --- FUNCIONES PARA ABRIR/CERRAR MENÚS ---
  toggleDropdownGenero() { 
    this.dropdownGeneroAbierto = !this.dropdownGeneroAbierto; 
    this.dropdownFamiliaAbierto = false; 
    this.dropdownOcasionAbierto = false;
  }
  
  toggleDropdownFamilia() { 
    this.dropdownFamiliaAbierto = !this.dropdownFamiliaAbierto; 
    this.dropdownGeneroAbierto = false; 
    this.dropdownOcasionAbierto = false;
  }
  toggleDropdownOcasion() { 
    this.dropdownOcasionAbierto = !this.dropdownOcasionAbierto; 
    this.dropdownGeneroAbierto = false; 
    this.dropdownFamiliaAbierto = false;
  }

  // --- FUNCIÓN PARA SELECCIONAR GÉNERO ---
  seleccionarGenero(genero: string) {
    this.nuevoPerfume.genero = genero;
    this.dropdownGeneroAbierto = false; 
  }
  seleccionarOcasion(ocasion: string) {
    this.nuevoPerfume.ocasion = ocasion;
    this.dropdownOcasionAbierto = false; 
  }
}