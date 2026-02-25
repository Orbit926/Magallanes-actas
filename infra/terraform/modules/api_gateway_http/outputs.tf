output "api_id" {
  description = "HTTP API Gateway ID"
  value       = aws_apigatewayv2_api.http.id
}

output "api_endpoint" {
  description = "HTTP API Gateway invoke URL (base)"
  value       = aws_apigatewayv2_api.http.api_endpoint
}

output "execution_arn" {
  description = "Execution ARN of the HTTP API"
  value       = aws_apigatewayv2_api.http.execution_arn
}
