locals {
  api_name = "${var.project_name}-${var.environment}-http-api"
}

# ── HTTP API ─────────────────────────────────────
resource "aws_apigatewayv2_api" "http" {
  name          = local.api_name
  protocol_type = "HTTP"
  description   = "HTTP API for ${var.project_name} (${var.environment})"

  cors_configuration {
    allow_origins = var.cors_allowed_origins
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 3600
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# ── Default stage with auto-deploy ───────────────
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
      integrationErr = "$context.integrationErrorMessage"
    })
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# ── CloudWatch log group for API Gateway ─────────
resource "aws_cloudwatch_log_group" "api_gw" {
  name              = "/aws/apigateway/${local.api_name}"
  retention_in_days = 14

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# ── Lambda integration ───────────────────────────
resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.lambda_invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

# ── Route: POST /send-contract ───────────────────
resource "aws_apigatewayv2_route" "send_contract" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "POST /send-contract"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

# ── Permission: API Gateway → Lambda ─────────────
resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}
