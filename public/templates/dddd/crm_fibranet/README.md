# CRM Products FibraNet — Validador Comercial

Aplicación Flask lista para abrir en **Visual Studio Code** y desplegar localmente.
Valida los datos de venta capturados desde el CRM contra el tarifario vigente y
expone endpoints REST para integrarse con un bot RPA.

## Estructura

```
crm_fibranet/
├── app.py                  # Punto de entrada Flask
├── requirements.txt
├── services/
│   ├── tarifario.py        # Catálogo + exportación Excel
│   └── validador.py        # Reglas de validación comercial
├── templates/              # Vistas Jinja
├── static/                 # CSS y JS
└── data/
    └── tarifario.json      # Catálogo seed (editable)
```

## Cómo ejecutar (VS Code)

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
python app.py
```

Abrir: <http://127.0.0.1:5002>

## Endpoints

| Método | Ruta                       | Descripción                            |
|-------|----------------------------|----------------------------------------|
| GET   | `/`                        | Pantalla de validación                 |
| POST  | `/validar`                 | Valida el formulario (JSON)            |
| POST  | `/api/crm/validar`         | Endpoint para el CRM / bot RPA         |
| GET   | `/api/catalogo`            | Snapshot completo del catálogo         |
| GET   | `/api/health`              | Healthcheck                            |
| GET   | `/descargar/tarifario`     | Descarga `Tarifario_Campanas_Vigente.xlsx` |

### Ejemplo de payload (CRM → RPA)

```json
{
  "campana": "Promo Flash",
  "plan": "Fibra 500 Mbps",
  "precio_registrado": 89.90,
  "canal_venta": "Web",
  "distrito": "Santiago de Surco",
  "medio_pago": "Tarjeta",
  "fecha_venta": "2026-06-22",
  "velocidad_max_cobertura_mbps": 1000
}
```

### Campos de respuesta (consumidos por el RPA)

`res_resultado_producto`, `res_decision_rpa`, `res_score_comercial`,
`res_precio_oficial`, `res_precio_registrado`, `res_canal_permitido`,
`res_velocidad_plan_mbps`, `res_observacion_producto`, `regla_aplicada`.

## Integración con el CRM

El CRM debe hacer `POST /api/crm/validar` con el JSON de la venta y leer
`res_decision_rpa` (`CONTINUAR`, `OBSERVAR`, `RECHAZAR`, `REVISION_HUMANA`)
para decidir el siguiente paso del flujo.
