PROMPT MAESTRO — Web App MVP “Exposure & Compliance Signals” (Next.js PWA + Glassmorph)

ROL DEL AGENTE
Eres un equipo senior full-stack (Product Engineer + Backend Serverless + Security) y debes construir un MVP vendible siguiendo estrictamente el boilerplate técnico Next.js PWA entregado por el usuario (estructura, principios, contratos y PWA). 

UMine – Boilerplate Técnico Nex…

 

UMine – Boilerplate Técnico Nex…

0) Objetivo del MVP (producto demo en 5 minutos)

Construir una web app B2B que permita a una organización:

subir un CSV con identidades (emails) y campos opcionales (rol, área, criticidad)

correr un Exposure Check (modo demo + modo adapter “real” listo para integrar después)

calcular Risk Score 0–100 por identidad + score agregado

generar recomendaciones por audiencia:

Seguridad (CTO/CISO)

Legal/DPO

Dirección (resumen ejecutivo)

exportar Evidence Pack: JSON + PDF con timeline, resultados y checklist de acciones

Restricción clave: el frontend consume contratos HTTP estables y no asume infraestructura. 

UMine – Boilerplate Técnico Nex…


Prohibido: usar Server Actions como backend oculto o acceder a DB desde frontend. 

UMine – Boilerplate Técnico Nex…

1) Ruta única: Frontend Next.js PWA (App Router) + Chakra UI v3

Stack obligatorio del MVP:

Next.js (App Router) + React + TypeScript

Chakra UI v3

PWA: manifest + service worker + offline-first selectivo 

UMine – Boilerplate Técnico Nex…

Reglas de arquitectura (no negociables):

Atomic Design para UI. 

UMine – Boilerplate Técnico Nex…

Context API solo como “App Shell” (estado global mínimo y explícito). 

UMine – Boilerplate Técnico Nex…

Observabilidad por defecto: todo evento importante se puede medir/trazar/auditar. 

UMine – Boilerplate Técnico Nex…

PWA no es “offline total”: cache controlado y resiliencia de red, no replicar lógica backend en cliente. 

UMine – Boilerplate Técnico Nex…

2) Estructura del repo (exacta)

Implementar la estructura de carpetas del boilerplate Next PWA: 

UMine – Boilerplate Técnico Nex…

app/

layout.tsx, page.tsx, error.tsx, not-found.tsx, loading.tsx

providers/AppProviders.tsx

config/env.ts, config/constants.ts

ui/ (Atomic Design: atoms/molecules/organisms/templates/pages)

services/

api/http.ts, api/client.ts, api/errors.ts

analytics/*

state/ (solo global transversal)

domain/ (lógica de negocio: scoring + recommendation engine)

AppProviders = núcleo de la app (ChakraProvider + contexts). 

UMine – Boilerplate Técnico Nex…

3) Diseño: Glassmorphism (premium, legible, accesible)

Requerimiento UI: estética glassmorph en light/dark.

Implementación:

Crear componente GlassCard (molecule) que se use en:

Dashboard cards

Import panel

Results table container

Recommendations panels

Reglas de estilo:

Usar backdropFilter: blur(...), fondo translúcido y borde sutil.

Respetar tokens/theme (no inline styles random fuera del theme).

Accesibilidad: si prefers-reduced-transparency → desactivar blur y usar superficies sólidas.

Entregables UI:

5 pantallas: Import, Dashboard, Results, Recommendations, Evidence Pack.

4) API contracts (HTTP) — uniformes y versionados

Contrato obligatorio (tal cual boilerplate):

Success: { "data": ..., "meta": ... }

Error: { "error": { "code", "message", "details?" }, "requestId": "..." } 

Pull Request - Template

Versionado por path /v1/... 

UMine – Boilerplate Técnico Nex…


Client HTTP único (no duplicar lógica entre server/client), baseURL desde NEXT_PUBLIC_API_BASE_URL. 

UMine – Boilerplate Técnico Nex…

 

UMine – Boilerplate Técnico Nex…

5) Backend: solo lo necesario para el MVP (API-first, serverless-friendly)

En el MVP puedes simular backend, pero deja la interfaz lista para serverless real.
Referencia de arquitectura backend API-first con API Gateway y endpoints /v1/*. 

UMine - Manifiesto Backend - Aw…

Endpoints del MVP:

POST /v1/projects

POST /v1/identities/import (CSV)

Ideal: no subir archivo por Lambda; usar presigned upload si ya lo implementan. 

UMine – Boilerplate Técnico Nex…

POST /v1/checks (start async check)

GET /v1/checks/{checkId}

GET /v1/projects/{projectId}/results

GET /v1/projects/{projectId}/recommendations

POST /v1/evidence/export (PDF + JSON)

6) Lógica de negocio (domain/)
6.1 Exposure Engine (3 modos)

Demo mode (MVP): dataset simulado reproducible (seed), para demos sin llaves.

Adapter mode: interfaz lista para integrar proveedor real después (sin implementarlo ahora).

Manual override: permitir marcar identidad como “confirmed exposed” para demo controlada.

Regla: nunca almacenar contraseñas ni “dump” de brecha; solo metadata mínima.

6.2 Risk scoring (0–100)

Entrada:

breach_count (0/1/2/3+)

recency_bucket (si existe; si no, “unknown”)

criticality (low/med/high)

role (admin/finance/clinical/support/other)

Salida:

score por identidad

score global

top 20

breakdown por rol/área

6.3 Recommendation Engine

Genera recomendaciones por severidad (Critical/High/Medium/Low) y por audiencia:

Seguridad: reset creds, MFA, review privileged, monitor anomalías

Legal/DPO: registro de diligencia (timeline), readiness DSAR, revisión vendors relacionados (si aplica)

Dirección: resumen ejecutivo “1 slide”: riesgo, acciones, estado

Importante: recomendaciones son “buenas prácticas” y “readiness”; no afirmar “obligación legal”.

7) Evidence Pack (evidencia vendible)
7.1 Evidence Vault (append-only)

Eventos mínimos:

project.created

identities.imported (con hash de dataset)

check.started

check.completed

action.marked_done

evidence.exported

7.2 Export

JSON: timeline + hashes + resultados agregados

PDF: resumen ejecutivo + top riesgos + checklist de acciones + requestId de llamadas relevantes

8) PWA y caching (solo lo que el boilerplate recomienda)

Cachear:

assets estáticos

shell

GET idempotentes (selectivo)

No cachear:

requests autenticados sensibles

mutaciones

data crítica en tiempo real 

UMine – Boilerplate Técnico Nex…

9) Observabilidad mínima (producto vendible)

Eventos mínimos de analytics:

app_started, page_view, cta_click, api_error 

UMine – Boilerplate Técnico Nex…


Más eventos producto:

import_started, import_completed

check_started, check_completed

evidence_exported

Tracking solo en Client Components. 

UMine – Boilerplate Técnico Nex…

10) Checklist de calidad (para PR / demo)

Seguir el checklist de PR (adaptado al proyecto):

UI con Atomic Design, sin lógica en atoms/molecules 

Pull Request - Template

Integraciones en services/*, no acoplar UI a infraestructura 

Pull Request - Template

Contratos API correctos (success/error + requestId) 

Pull Request - Template

Light/Dark + responsive validado 

Pull Request - Template

11) OUTPUT OBLIGATORIO DEL AGENTE (lo que debe entregar)

En la respuesta final, entregar:

estructura de carpetas exacta

theme Chakra (glassmorph) + componente GlassCard

pantallas (Import, Dashboard, Results, Recommendations, Evidence Pack)

contratos API con ejemplos request/response

domain logic (scoring + recommendations)

estrategia de CSV parsing + dedupe + hashing

export Evidence Pack (PDF outline + JSON ejemplo)

how-to-run local + .env.example (solo NEXT_PUBLIC_* públicos) 

UMine – Boilerplate Técnico Nex…

Nota final (muy importante)

Mantén el prompt y la implementación 100% enfocados en:

ingestión de identidades (CSV)

scoring + recomendaciones

evidencia exportable

UI glassmorph

No agregues SSO, licencias, marketplace, ni cosas de plataforma: eso queda fuera del MVP.