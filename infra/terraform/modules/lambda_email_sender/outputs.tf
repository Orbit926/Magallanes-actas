output "function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.email_sender.function_name
}

output "function_arn" {
  description = "Lambda function ARN"
  value       = aws_lambda_function.email_sender.arn
}

output "invoke_arn" {
  description = "Lambda invoke ARN (used by API Gateway integration)"
  value       = aws_lambda_function.email_sender.invoke_arn
}
