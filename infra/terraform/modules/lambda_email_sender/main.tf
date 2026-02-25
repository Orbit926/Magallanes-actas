locals {
  function_name = "${var.project_name}-${var.environment}-email-sender"
}

# ── Package source code ──────────────────────────
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = var.source_dir
  output_path = "${path.module}/../../.build/lambda_email_sender.zip"
}

# ── CloudWatch log group ─────────────────────────
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${local.function_name}"
  retention_in_days = 14

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# ── Lambda function ──────────────────────────────
resource "aws_lambda_function" "email_sender" {
  function_name    = local.function_name
  description      = "Sends contract PDF via Zoho Mail API"
  role             = var.lambda_role_arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  memory_size      = var.memory_size
  timeout          = var.timeout
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = {
      SELLER_EMAIL           = var.seller_email
      ZOHO_FROM_EMAIL        = var.zoho_from_email
      ZOHO_API_BASE_URL      = var.zoho_api_base_url
      ZOHO_TOKEN_SECRET_NAME = var.zoho_token_secret_name
      NODE_OPTIONS           = "--enable-source-maps"
    }
  }

  depends_on = [aws_cloudwatch_log_group.lambda]

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}
