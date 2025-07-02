# Horizon - Versiones Standalone

Este directorio contiene las versiones standalone de todas las páginas del proyecto Horizon. Cada página HTML es completamente independiente y contiene todos los estilos, animaciones y funcionalidades necesarias para funcionar sin dependencias externas (excepto Tailwind CSS CDN y Google Fonts).

## Páginas Standalone Creadas

### 1. `standalone-index.html`
- **Descripción**: Página principal de inicio de sesión
- **Características**: 
  - Formulario de login con validación
  - Animación de fondo de partículas
  - Botones de inicio de sesión social
  - Funcionalidad de mostrar/ocultar contraseña
- **Navegación**: Al hacer login exitoso, redirige a `standalone-portfolios.html`

### 2. `standalone-register.html`
- **Descripción**: Página de registro de usuarios
- **Características**:
  - Formulario de registro completo
  - Validación de coincidencia de contraseñas
  - Misma animación de fondo
  - Campos adicionales (fecha nacimiento, género)
- **Navegación**: Al registrarse exitosamente, redirige a `standalone-portfolios.html`

### 3. `standalone-portfolios.html`
- **Descripción**: Página principal de gestión de portafolios
- **Características**:
  - Lista de portafolios existentes
  - Resumen de valores totales
  - Botón para crear nuevo portafolio
  - Efectos de hover interactivos
- **Navegación**: 
  - Crear portafolio → `standalone-create-portfolio.html`
  - Gestionar activos → `standalone-assets.html`

### 4. `standalone-create-portfolio.html`
- **Descripción**: Página para crear nuevos portafolios
- **Características**:
  - Formulario con validación
  - Contador de caracteres en tiempo real
  - Plantillas preconfiguradas (Tech, Dividendos, Crypto)
  - Mensaje de éxito animado
- **Navegación**: Al crear exitosamente, redirige a `standalone-assets.html`

### 5. `standalone-assets.html`
- **Descripción**: Página para gestionar activos de un portafolio
- **Características**:
  - Dropdown inteligente para selección de activos
  - Base de datos simulada de activos financieros
  - Búsqueda en tiempo real
  - Cálculo automático de valores totales
  - Funcionalidad completa de CRUD para activos
- **Navegación**: Permite volver a `standalone-portfolios.html`

## Características Técnicas Integradas

### Animación de Fondo
- **Sistema de partículas**: Cada página incluye la misma animación de red neuronal/blockchain
- **Responsivo**: Se adapta automáticamente al redimensionamiento de ventana
- **Rendimiento optimizado**: Usa requestAnimationFrame para animaciones fluidas

### Estilos Unificados
- **Tema Financial Tech Dark**: Paleta consistente en todas las páginas
- **Efecto Glassmorphism**: Tarjetas translúcidas con blur
- **Componentes reutilizables**: Botones, inputs y elementos UI consistentes

### Funcionalidades JavaScript
- **Manejo de formularios**: Validación completa y experiencia de usuario mejorada
- **Navegación fluida**: Transiciones suaves entre páginas
- **Estado persistente**: URLs con parámetros para mantener contexto
- **Interacciones avanzadas**: Dropdowns, búsquedas, contadores dinámicos

## Estructura de Archivos Standalone

Cada archivo HTML standalone incluye:

```html
<!-- Head con imports CDN -->
<head>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="Google Fonts" />
    <link href="Material Symbols" />
    <style>
        /* Todos los estilos CSS integrados */
    </style>
</head>

<body>
    <!-- Canvas para animación de fondo -->
    <canvas id="background-canvas"></canvas>
    
    <!-- Contenido específico de la página -->
    <div class="page-content">...</div>
    
    <script>
        // Clase BackgroundAnimation
        // Clase Particle
        // Lógica específica de la página
        // Event listeners y inicialización
    </script>
</body>
```

## Cómo Usar

1. **Abrir cualquier página**: Cada archivo HTML puede abrirse directamente en un navegador
2. **Flujo completo**: Comenzar con `standalone-index.html` y seguir el flujo natural
3. **Desarrollo**: Cada página es independiente, facilitando el desarrollo y testing
4. **Despliegue**: Se pueden desplegar individualmente o como conjunto

## Beneficios del Enfoque Standalone

### ✅ Ventajas
- **Independencia total**: No hay dependencias entre archivos
- **Fácil despliegue**: Cada página funciona por sí sola
- **Desarrollo ágil**: Cambios en una página no afectan otras
- **Testing simplificado**: Pruebas individuales por página
- **Carga rápida**: Todo el código necesario en un solo archivo

### ⚠️ Consideraciones
- **Duplicación de código**: Las clases y estilos se repiten
- **Tamaño de archivos**: Cada HTML es más grande por la integración
- **Mantenimiento**: Cambios globales requieren editar múltiples archivos

## Personalización

Para modificar el comportamiento:

1. **Cambiar colores**: Editar las variables CSS en la sección `<style>`
2. **Ajustar animaciones**: Modificar `particleConfig` en `BackgroundAnimation`
3. **Añadir funcionalidades**: Extender las clases JavaScript específicas
4. **Cambiar navegación**: Actualizar los enlaces `href` en los elementos de navegación

## Compatibilidad

- **Navegadores modernos**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Responsivo**: Funciona en dispositivos móviles y escritorio
- **Sin dependencias locales**: Solo requiere conexión a internet para CDN

---

**Nota**: Estas páginas standalone mantienen toda la funcionalidad y estética del proyecto original, pero de forma completamente independiente para facilitar el desarrollo, testing y despliegue.
