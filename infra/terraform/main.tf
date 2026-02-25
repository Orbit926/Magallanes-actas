# ══════════════════════════════════════════════════
# main.tf — Module orchestrator
# ══════════════════════════════════════════════════

# ── Secrets Manager (Zoho token container) ───────
module "secrets" {
  source = "./modules/secrets"

  project_name = var.project_name
  environment  = var.environment
  secret_name  = var.secret_name_zoho_token
}

# ── IAM role & policies for Lambda ───────────────
module "iam" {
  source = "./modules/iam"

  project_name = var.project_name
  environment  = var.environment
  secret_arn   = module.secrets.secret_arn
}

# ── Lambda: email sender ─────────────────────────
module "lambda" {
  source = "./modules/lambda_email_sender"

  project_name           = var.project_name
  environment            = var.environment
  lambda_role_arn        = module.iam.lambda_role_arn
  source_dir             = "${path.module}/lambda_src"
  memory_size            = var.lambda_memory
  timeout                = var.lambda_timeout
  seller_email           = var.seller_email
  zoho_from_email        = var.zoho_from_email
  zoho_api_base_url      = var.zoho_api_base_url
  zoho_token_secret_name = var.secret_name_zoho_token
}

# ── API Gateway HTTP API ─────────────────────────
module "api_gateway" {
  source = "./modules/api_gateway_http"

  project_name         = var.project_name
  environment          = var.environment
  lambda_function_name = module.lambda.function_name
  lambda_invoke_arn    = module.lambda.invoke_arn
  cors_allowed_origins = var.cors_allowed_origins
}
