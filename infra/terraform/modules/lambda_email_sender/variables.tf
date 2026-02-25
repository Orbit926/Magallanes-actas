variable "project_name" {
  description = "Project identifier for naming"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "lambda_role_arn" {
  description = "ARN of the IAM role for the Lambda"
  type        = string
}

variable "source_dir" {
  description = "Path to the Lambda source code directory"
  type        = string
}

variable "memory_size" {
  description = "Lambda memory in MB"
  type        = number
  default     = 256
}

variable "timeout" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 30
}

variable "seller_email" {
  description = "Seller email address"
  type        = string
}

variable "zoho_from_email" {
  description = "From email for Zoho Mail API"
  type        = string
}

variable "zoho_api_base_url" {
  description = "Base URL of the Zoho Mail API"
  type        = string
}

variable "zoho_token_secret_name" {
  description = "Name of the Secrets Manager secret holding the Zoho OAuth token"
  type        = string
}
