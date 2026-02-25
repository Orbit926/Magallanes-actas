# Infraestructura Terraform — Magallanes Residencial

Infraestructura AWS Serverless para el endpoint de envío de contratos por correo electrónico vía Zoho Mail API.

## Arquitectura

```
Frontend (React)
    │
    ▼  POST /send-contract (JSON)
API Gateway HTTP API  ──►  Lambda (Node.js 18)
                               │
                               ├── Lee token de Secrets Manager
                               └── Envía correo vía Zoho Mail API
                                     • To:  client_email
                                     • Cc:  SELLER_EMAIL
                                     • Adjunto: archivo base64
```

## Estructura de carpetas

```
infra/terraform/
├── main.tf                        # Orquestador de módulos
├── variables.tf                   # Variables del root
├── outputs.tf                     # Outputs del root
├── providers.tf                   # AWS provider config
├── versions.tf                    # Required providers y version
├── terraform.tfvars.example       # Ejemplo de variables
├── .gitignore
├── README.md
├── lambda_src/                    # Código fuente de la Lambda
│   ├── index.js
│   └── package.json
└── modules/
    ├── secrets/                   # Secrets Manager (contenedor del token Zoho)
    ├── iam/                       # IAM role y policies para Lambda
    ├── lambda_email_sender/       # Lambda function + CloudWatch logs
    └── api_gateway_http/          # HTTP API + route + integration + CORS
```

## Pre-requisitos

- [Terraform](https://www.terraform.io/downloads) >= 1.5
- AWS CLI configurado con un perfil válido
- Node.js 18+ (solo si necesitas probar la Lambda localmente)
- Una cuenta Zoho con acceso a la Mail API

## Inicio rápido

### 1. Configurar variables

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
# Edita terraform.tfvars con tus valores reales
```

### 2. Inicializar y desplegar

```bash
terraform init
terraform plan
terraform apply
```

### 3. Cargar el token de Zoho en Secrets Manager

**Importante:** Terraform solo crea el *contenedor* del secreto. Debes cargar el valor manualmente:

```bash
aws secretsmanager put-secret-value \
  --secret-id "magallanes/zoho-oauth-token" \
  --secret-string '{"access_token":"TU_ZOHO_OAUTH_TOKEN","account_id":"TU_ZOHO_ACCOUNT_ID"}' \
  --profile tu-perfil \
  --region us-east-1
```

> **¿Cómo obtener estos valores?**
>
> - `access_token`: Genera un token OAuth 2.0 desde la [Zoho API Console](https://api-console.zoho.com/).
>   Scopes requeridos: `ZohoMail.messages.CREATE`, `ZohoMail.accounts.READ`
> - `account_id`: Llama a `GET /api/accounts` con tu token para obtener el ID de tu cuenta de correo.

### 4. Probar el endpoint

Después de `terraform apply`, copia la URL del output `api_endpoint_url`:

```bash
curl -X POST "https://XXXXXX.execute-api.us-east-1.amazonaws.com/send-contract" \
  -H "Content-Type: application/json" \
  -d '{
    "client_email": "cliente@ejemplo.com",
    "file_name": "Contrato_Casa_1.pdf",
    "file_base64": "JVBERi0xLjQK...",
    "mime_type": "application/pdf"
  }'
```

Respuesta exitosa:
```json
{ "ok": true, "message": "Email sent successfully" }
```

Errores comunes:
```json
{ "ok": false, "error": "Missing or invalid client_email" }
{ "ok": false, "error": "Zoho API returned an error", "zoho_status": 401 }
```

## Variables disponibles

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `aws_profile` | string | `"default"` | Perfil de AWS CLI |
| `aws_region` | string | `"us-east-1"` | Región de AWS |
| `default_tags` | map(string) | `{ManagedBy="terraform"}` | Tags globales |
| `project_name` | string | `"magallanes"` | Identificador del proyecto |
| `environment` | string | `"dev"` | Ambiente: dev/stage/prod |
| `seller_email` | string | — | Email del vendedor (Cc) |
| `zoho_from_email` | string | — | Email remitente en Zoho |
| `zoho_api_base_url` | string | `"https://mail.zoho.com"` | Base URL de la API de Zoho |
| `secret_name_zoho_token` | string | `"magallanes/zoho-oauth-token"` | Nombre del secreto en SM |
| `cors_allowed_origins` | list(string) | `["*"]` | Orígenes CORS permitidos |
| `lambda_memory` | number | `256` | Memoria de la Lambda (MB) |
| `lambda_timeout` | number | `30` | Timeout de la Lambda (s) |

## Outputs

| Output | Descripción |
|---|---|
| `api_endpoint_url` | URL completa del endpoint `POST /send-contract` |
| `api_gateway_id` | ID del API Gateway |
| `lambda_function_name` | Nombre de la función Lambda |
| `lambda_function_arn` | ARN de la función Lambda |
| `lambda_role_arn` | ARN del rol IAM de la Lambda |
| `secret_arn` | ARN del secreto en Secrets Manager |
| `secret_name` | Nombre del secreto (para uso con AWS CLI) |

## Notas sobre Zoho Mail API vs ZeptoMail

### Zoho Mail API (implementación actual)

- Endpoint: `POST /api/accounts/{accountId}/messages`
- Auth: Header `Authorization: Zoho-oauthtoken {token}`
- Attachments: Array de objetos con `content` (base64), `storeName`, `mimeType`
- [Documentación](https://www.zoho.com/mail/help/api/post-send-an-email.html)

### ZeptoMail (alternativa transaccional)

Si usas ZeptoMail en lugar de Zoho Mail:
- Endpoint: `POST https://api.zeptomail.com/v1.1/email`
- Auth: Header `Authorization: Zoho-enczapikey {api_key}`
- El payload es diferente (usa `from`, `to`, `subject`, `htmlbody`, `attachments`)
- Modifica `index.js` y `ZOHO_API_BASE_URL` según la [documentación de ZeptoMail](https://www.zoho.com/zeptomail/help/api/)

## Limpieza

```bash
terraform destroy
```

## Permisos IAM (principio de mínimo privilegio)

La Lambda solo tiene:
- **CloudWatch Logs**: `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents`
- **Secrets Manager**: `secretsmanager:GetSecretValue` (solo el secreto específico del token)
