# ──────────────────────────────────────────────
# AWS Provider
# ──────────────────────────────────────────────
variable "aws_profile" {
  description = "AWS CLI profile to use"
  type        = string
  default     = "default"
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "default_tags" {
  description = "Default tags applied to all resources"
  type        = map(string)
  default = {
    ManagedBy = "terraform"
  }
}

# ──────────────────────────────────────────────
# Project
# ──────────────────────────────────────────────
variable "project_name" {
  description = "Short project identifier used for naming resources"
  type        = string
  default     = "magallanes"
}

variable "environment" {
  description = "Deployment environment (dev / stage / prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "stage", "prod"], var.environment)
    error_message = "environment must be one of: dev, stage, prod."
  }
}

# ──────────────────────────────────────────────
# Email / Zoho SMTP
# ──────────────────────────────────────────────
variable "seller_email" {
  description = "Seller email (bcc on every contract sent)"
  type        = string
}

variable "zoho_from_email" {
  description = "From address used in outgoing emails"
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

# ──────────────────────────────────────────────
# API Gateway
# ──────────────────────────────────────────────
variable "cors_allowed_origins" {
  description = "Origins allowed by CORS on the HTTP API"
  type        = list(string)
  default     = ["*"]
}

# ──────────────────────────────────────────────
# Lambda tuning
# ──────────────────────────────────────────────
variable "lambda_memory" {
  description = "Lambda memory in MB"
  type        = number
  default     = 256
}

variable "lambda_timeout" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 30
}
