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
  description = "From email address used in outgoing emails"
  type        = string
}

variable "zoho_smtp_host" {
  description = "Zoho SMTP server hostname"
  type        = string
  default     = "smtp.zoho.com"
}

variable "zoho_smtp_port" {
  description = "Zoho SMTP SSL port"
  type        = number
  default     = 465
}

variable "zoho_smtp_user" {
  description = "Zoho SMTP username (email)"
  type        = string
  sensitive   = true
}

variable "zoho_smtp_pass" {
  description = "Zoho SMTP password or app-specific password"
  type        = string
  sensitive   = true
}
