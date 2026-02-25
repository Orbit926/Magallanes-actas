output "api_endpoint_url" {
  description = "Full URL of the POST /send-contract endpoint"
  value       = "${module.api_gateway.api_endpoint}/send-contract"
}

output "api_gateway_id" {
  description = "HTTP API Gateway ID"
  value       = module.api_gateway.api_id
}

output "lambda_function_name" {
  description = "Name of the email-sender Lambda function"
  value       = module.lambda.function_name
}

output "lambda_function_arn" {
  description = "ARN of the email-sender Lambda function"
  value       = module.lambda.function_arn
}

output "lambda_role_arn" {
  description = "IAM role ARN used by the Lambda"
  value       = module.iam.lambda_role_arn
}
