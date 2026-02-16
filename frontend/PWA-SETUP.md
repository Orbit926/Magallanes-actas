# PWA Setup - Entrega Digital para iPad

## Resumen de Configuración

Esta aplicación está configurada como una Progressive Web App (PWA) optimizada para iPad.

## Archivos Creados/Modificados

### Archivos de Configuración PWA
- `public/manifest.json` - Manifest de la PWA
- `public/sw.js` - Service Worker para cache offline
- `index.html` - Meta tags para iOS/iPad

### Componentes React
- `src/components/PWAInstallPrompt.jsx` - Prompt de instalación para iOS

### Estilos
- `src/index.css` - Estilos optimizados para PWA y iPad

---

## Íconos Requeridos

Debes crear los siguientes íconos y colocarlos en `public/icons/`:

| Archivo | Tamaño | Uso |
|---------|--------|-----|
| `icon-72x72.png` | 72x72 | Android |
| `icon-96x96.png` | 96x96 | Android |
| `icon-128x128.png` | 128x128 | Android |
| `icon-144x144.png` | 144x144 | Android |
| `icon-152x152.png` | 152x152 | iPad |
| `icon-167x167.png` | 167x167 | iPad Pro |
| `icon-192x192.png` | 192x192 | Android/PWA |
| `icon-384x384.png` | 384x384 | Android |
| `icon-512x512.png` | 512x512 | PWA/Splash |
| `apple-touch-icon.png` | 180x180 | iOS |
| `icon-16x16.png` | 16x16 | Favicon |
| `icon-32x32.png` | 32x32 | Favicon |

### Cómo Generar Íconos

1. **Opción 1: Herramienta Online**
   - Usa [RealFaviconGenerator](https://realfavicongenerator.net/)
   - Sube tu logo y descarga todos los tamaños

2. **Opción 2: Desde tu logo existente**
   ```bash
   # Si tienes ImageMagick instalado:
   cd public/icons
   
   # Genera todos los tamaños desde logo.png
   convert ../logos/logo.png -resize 72x72 icon-72x72.png
   convert ../logos/logo.png -resize 96x96 icon-96x96.png
   convert ../logos/logo.png -resize 128x128 icon-128x128.png
   convert ../logos/logo.png -resize 144x144 icon-144x144.png
   convert ../logos/logo.png -resize 152x152 icon-152x152.png
   convert ../logos/logo.png -resize 167x167 icon-167x167.png
   convert ../logos/logo.png -resize 192x192 icon-192x192.png
   convert ../logos/logo.png -resize 384x384 icon-384x384.png
   convert ../logos/logo.png -resize 512x512 icon-512x512.png
   convert ../logos/logo.png -resize 180x180 apple-touch-icon.png
   convert ../logos/logo.png -resize 16x16 icon-16x16.png
   convert ../logos/logo.png -resize 32x32 icon-32x32.png
   ```

---

## Splash Screens para iPad

Coloca las siguientes imágenes en `public/splash/`:

| Archivo | Tamaño | Dispositivo |
|---------|--------|-------------|
| `splash-2048x2732.png` | 2048x2732 | iPad Pro 12.9" |
| `splash-1668x2388.png` | 1668x2388 | iPad Pro 11" |
| `splash-1668x2224.png` | 1668x2224 | iPad Pro 10.5" |
| `splash-1536x2048.png` | 1536x2048 | iPad Mini/Air |

### Cómo Crear Splash Screens

1. Crea una imagen con fondo `#F5F7FA`
2. Centra tu logo en la imagen
3. Exporta en los tamaños indicados

---

## Instalación en iPad

### Pasos para el Usuario Final

1. Abre Safari en el iPad
2. Navega a la URL de la aplicación (debe ser HTTPS)
3. Toca el botón **Compartir** (ícono de cuadrado con flecha)
4. Selecciona **"Añadir a pantalla de inicio"**
5. Confirma el nombre y toca **"Añadir"**
6. La app aparecerá en la pantalla de inicio

### Comportamiento Esperado

- ✅ Abre en modo standalone (sin barra de Safari)
- ✅ Muestra splash screen al iniciar
- ✅ Funciona offline (archivos cacheados)
- ✅ Se siente como app nativa

---

## Verificación de PWA

### En Chrome DevTools

1. Abre DevTools (F12)
2. Ve a la pestaña **Application**
3. Revisa:
   - **Manifest** - Debe mostrar tu manifest.json
   - **Service Workers** - Debe estar registrado
   - **Cache Storage** - Debe tener archivos cacheados

### En Safari (Mac)

1. Abre **Develop > Show Web Inspector**
2. Ve a **Application** > **Manifest**
3. Verifica que el manifest se carga correctamente

### Lighthouse Audit

1. En Chrome DevTools, ve a **Lighthouse**
2. Selecciona **Progressive Web App**
3. Ejecuta el audit
4. Revisa los resultados

---

## Notas Importantes para iPad/Safari

### Limitaciones de iOS Safari

1. **Service Worker**: iOS Safari soporta Service Workers desde iOS 11.3
2. **Cache**: El cache puede ser limpiado por iOS si hay poca memoria
3. **Push Notifications**: NO soportadas en iOS PWA
4. **Background Sync**: NO soportado en iOS

### Mejores Prácticas

1. **HTTPS Obligatorio**: La PWA solo funciona en HTTPS
2. **Viewport**: Configurado con `viewport-fit=cover` para safe areas
3. **Status Bar**: Configurado como `black-translucent`
4. **Zoom**: Deshabilitado para evitar zoom accidental en inputs

---

## Troubleshooting

### La app no se instala

- Verifica que estés en HTTPS
- Verifica que el manifest.json sea accesible
- Revisa la consola por errores

### No aparece el ícono correcto

- Limpia el cache de Safari
- Verifica que `apple-touch-icon.png` existe
- El ícono debe ser PNG sin transparencia

### La app no funciona offline

- Verifica que el Service Worker esté registrado
- Revisa que los archivos estén en el cache
- Abre la app al menos una vez con conexión

### El splash screen no aparece

- Verifica los tamaños exactos de las imágenes
- Las imágenes deben ser PNG
- Limpia el cache y reinstala la app

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

---

## Checklist de Deployment

- [ ] Íconos generados en todos los tamaños
- [ ] Splash screens creados para iPad
- [ ] Build de producción generado
- [ ] Desplegado en servidor HTTPS
- [ ] Probado en iPad real
- [ ] Service Worker funcionando
- [ ] Cache offline verificado
