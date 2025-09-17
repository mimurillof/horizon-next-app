# Sistema de Selección de Activos Financieros

Este documento explica cómo configurar y usar el sistema de selección de activos financieros integrado en la aplicación Horizon.

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con tu clave de API de Financial Modeling Prep:

```env
FMP_API_KEY=tu_clave_de_api_aqui
```

### 2. Obtener Clave de API

1. Visita [Financial Modeling Prep](https://site.financialmodelingprep.com/developer)
2. Regístrate para obtener una cuenta gratuita
3. Copia tu clave de API
4. Pégala en el archivo `.env.local`

## 📁 Estructura de Archivos

### API Routes (Backend)
- `src/app/api/search-assets/route.ts` - Búsqueda de activos
- `src/app/api/get-asset-profile/route.ts` - Perfil detallado de activos

### Componentes (Frontend)
- `src/components/AssetSelector.tsx` - Componente principal de selección
- `src/app/portfolios/[portfolioId]/page.tsx` - Página integrada del portfolio

### Estilos
- `src/app/globals.css` - Estilos adicionales para el selector

## 🛠 Funcionalidades

### Búsqueda de Activos
- **Búsqueda en tiempo real** con debounce de 500ms
- **Filtrado inteligente** por nombre, símbolo y exchange
- **Dropdown interactivo** con navegación por teclado
- **Prevención de duplicados** automática

### Gestión de Portfolio
- **Agregar activos** desde la API en tiempo real
- **Editar valores** de adquisición y fechas
- **Eliminar activos** individualmente
- **Cálculo automático** del valor total del portfolio

### Datos en Tiempo Real
- **Precios actuales** de Financial Modeling Prep
- **Logotipos** de empresas automáticos
- **Información completa** de la empresa (sector, industria, CEO, etc.)
- **Múltiples exchanges** soportados

## 🎨 Características de UI/UX

### Diseño Responsivo
- **Adaptable** a móviles y desktop
- **Glass morphism** siguiendo el diseño de Horizon
- **Animaciones suaves** y transiciones
- **Estados de carga** claros

### Experiencia de Usuario
- **Autocompletado** inteligente
- **Validación** de campos en tiempo real
- **Feedback visual** para acciones del usuario
- **Manejo de errores** elegante

## 🔧 Uso del Componente

### Básico
```tsx
import AssetSelector from '@/components/AssetSelector';

function MyPortfolio() {
  const handleAssetsChange = (assets) => {
    console.log('Activos actualizados:', assets);
  };

  return (
    <AssetSelector onAssetsChange={handleAssetsChange} />
  );
}
```

### Con Datos Iniciales
```tsx
<AssetSelector 
  onAssetsChange={handleAssetsChange}
  initialAssets={existingAssets}
/>
```

## 📊 Estructura de Datos

### Resultado de Búsqueda
```typescript
interface SearchResult {
  symbol: string;           // Ej: "AAPL"
  name: string;            // Ej: "Apple Inc."
  exchangeShortName: string; // Ej: "NASDAQ"
  type: string;            // Ej: "stock"
}
```

### Perfil de Activo
```typescript
interface AssetProfile {
  symbol: string;
  companyName: string;
  price: number;
  changes: number;
  changesPercentage: number;
  exchange: string;
  industry: string;
  sector: string;
  currency: string;
  image: string;           // URL del logo
  // ... más campos
}
```

### Activo de Portfolio
```typescript
interface PortfolioAsset extends AssetProfile {
  acquisitionDate: string;  // Fecha de adquisición
  acquisitionValue: number; // Valor de adquisición
  id: string;              // ID único
}
```

## 🚦 Estados de la Aplicación

### Estados de Carga
- ⏳ **Búsqueda** - Muestra spinner mientras busca
- ✅ **Éxito** - Activo agregado correctamente
- ❌ **Error** - Manejo de errores de API
- 🔄 **Guardado** - Feedback al guardar portfolio

### Validaciones
- ✓ **Duplicados** - Previene agregar el mismo activo
- ✓ **Fechas** - Validación de fechas de adquisición
- ✓ **Valores** - Números positivos únicamente

## 🔍 Ejemplos de Búsqueda

### Búsquedas Válidas
- `Apple` → Encuentra Apple Inc. (AAPL)
- `TSLA` → Encuentra Tesla Inc.
- `Microsoft` → Encuentra Microsoft Corp.
- `BTC` → Encuentra criptomonedas Bitcoin

### Características de Búsqueda
- **Mínimo 2 caracteres** para activar búsqueda
- **Máximo 10 resultados** por consulta
- **Búsqueda global** en todos los exchanges
- **Soporte multiidioma** limitado por la API

## 🛡 Seguridad

### API Routes
- **Proxy seguro** - Las claves API nunca se exponen al cliente
- **Validación** de parámetros en el servidor
- **Manejo de errores** robusto
- **Rate limiting** inherente de la API externa

### Datos
- **Sanitización** automática de entradas
- **Escape de caracteres** especiales
- **Validación** de tipos de datos

## 🧪 Testing

### Casos de Prueba Recomendados
1. **Búsqueda exitosa** con resultados válidos
2. **Búsqueda sin resultados** con término inválido
3. **Agregado de activos** múltiples
4. **Eliminación de activos** individual
5. **Edición de valores** y fechas
6. **Guardado de portfolio** completo

### Mock de APIs
Para desarrollo sin clave API, puedes modificar las rutas para devolver datos simulados.

## 🔄 Actualizaciones Futuras

### Características Planificadas
- [ ] **Persistencia** en base de datos
- [ ] **Autenticación** de usuarios
- [ ] **Gráficos** de rendimiento
- [ ] **Alertas** de precios
- [ ] **Portfolio sharing**
- [ ] **Análisis** de riesgo

### Mejoras Técnicas
- [ ] **Cache** de búsquedas
- [ ] **Paginación** de resultados
- [ ] **WebSockets** para precios en vivo
- [ ] **PWA** support
- [ ] **Tests** automatizados

## 📞 Soporte

### Errores Comunes

#### "API key no configurada"
- Verifica que `.env.local` existe y tiene `FMP_API_KEY`
- Reinicia el servidor de desarrollo

#### "Error al contactar la API"
- Verifica tu conexión a internet
- Confirma que tu clave API es válida
- Revisa los límites de tu plan de API

#### "Activo no encontrado"
- Algunos activos pueden no estar disponibles
- Intenta con símbolos más comunes (AAPL, MSFT, etc.)

### Logs de Debug
Los errores se registran en la consola del navegador y en los logs del servidor.

---

¡Sistema de selección de activos implementado exitosamente! 🎉
