# Pokémon Bank — Simulador de Cajero Automático (ATM)

**Universidad Don Bosco · Lenguajes Interpretados en el Cliente (LIC941)**
**Proyecto de Cátedra — Fase 1 (HTML5 + CSS3 + Bootstrap 4)**

Propuesta de interfaz web responsive que simula un cajero automático a partir de los datos de un usuario de prueba.

## Usuario de prueba

| Dato | Valor |
|------|-------|
| Titular | Ash Ketchum |
| N.º de cuenta | PKB-2026-000151 |
| PIN | 1234 |
| Saldo | $1,250.75 |

## Pantallas (todo en una sola página: `index.html`)

| Vista | Enlace interno | Descripción |
|-------|----------------|-------------|
| Login | `#login` (por defecto) | PIN de 4 dígitos |
| Acciones | `#acciones` | Nombre y cuenta del titular; depósito, retiro, consulta de saldo y pago de servicios; salir |
| Historial | `#historial` | Transacciones con filtro por tipo |
| Gráfico | `#grafico` | Análisis por tipo de transacción |

El **panel lateral** permite moverse entre Acciones, Historial y Gráfico, y salir al login. En pantallas pequeñas pasa a ser una barra superior.

## Estructura del proyecto

```
pokemon-bank/
├── index.html           (aplicación completa de una sola página)
├── css/
│   └── styles.css
├── js/
│   └── main.js          (reservado para la Fase 2)
├── images/
├── ejemplos/            (sweetalert, jspdf, chartjs, validatejs)
├── .gitignore
└── README.md
```

## Cómo ejecutarlo

1. Descarga o clona el repositorio.
2. Abre `index.html` en un navegador moderno (Chrome, Edge, Firefox o Safari reciente) (se requiere conexión a internet para cargar Bootstrap desde su CDN).
3. Ingresa el PIN `1234` y navega entre las pantallas.

## Tecnologías

- HTML5 y CSS3
- Bootstrap 4.6 (CDN) como framework CSS responsive
- Git y GitHub para el versionamiento
- Librerías de ejemplo (Fase 2): SweetAlert, jsPDF, Chart.js y ValidateJS

> La navegación, las ventanas, el filtro del historial y los gráficos se construyen con HTML y CSS (`:target`, `:checked`, `conic-gradient`).
> `js/main.js` agrega la lógica: valida el PIN, y cada depósito, retiro, consulta o pago actualiza el saldo, el historial y los gráficos (se guarda en localStorage). El botón «Restablecer datos de prueba» del historial vuelve al estado inicial.
