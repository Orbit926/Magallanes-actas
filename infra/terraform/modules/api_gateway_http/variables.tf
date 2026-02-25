variable "project_name" {
  description = "Project identifier for naming"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "lambda_function_name" {
  description = "Name of the Lambda function to integrate"
  type        = string
}

variable "lambda_invoke_arn" {
  description = "Invoke ARN of the Lambda function"
  type        = string
}

variable "cors_allowed_origins" {
  description = "Origins allowed by CORS"
  type        = list(string)
  default     = ["*"]
}
