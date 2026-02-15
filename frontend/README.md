# Entrega Digital - Demo

Sistema de **Entrega-Recepción + Póliza de Garantía** para constructora.  
Demo 100% frontend, sin backend ni base de datos.

## Stack

- **React** (Vite)
- **Material UI (MUI)** — CSS-in-JS con `sx`
- **jsPDF** + **jspdf-autotable** — generación de PDF en el navegador
- **signature_pad** — firma digital con canvas

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm run dev
```

Se abrirá en `http://localhost:5173` (o el puerto que indique Vite).

## Cómo usar el demo

1. **Paso 1 — Datos del propietario y vivienda**  
   Llena el formulario o usa el botón **"Cargar ejemplo"** para prellenar con datos ficticios.

2. **Paso 2 — Contrato prellenado**  
   Revisa el acta de entrega-recepción con los datos insertados automáticamente.

3. **Paso 3 — Checklist de entrega**  
   Marca los puntos verificados (puedes hacer clic en el encabezado de sección para seleccionar todos). Activa la casilla de confirmación final para continuar.

4. **Paso 4 — Firma y descarga de PDF**  
   Dibuja tu firma con el mouse o con el dedo en pantalla táctil. Haz clic en **"Finalizar y Descargar PDF"** para generar y descargar el documento.

### Sobre el PDF generado

- Mínimo 3 páginas: contrato, checklist, póliza de garantía
- Cada página incluye footer con folio, fecha/hora y firma digital
- Nombre del archivo: `Acta_Entrega_Recepcion_Casa_<num>_<apellido>.pdf`
- Folio único: `HM-<casa>-<YYYYMMDD>-<4 dígitos>`
