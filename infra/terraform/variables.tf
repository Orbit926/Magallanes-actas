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
# Email / Zoho
# ──────────────────────────────────────────────
variable "seller_email" {
  description = "Seller email (cc/bcc on every contract sent)"
  type        = string
}

variable "zoho_from_email" {
  description = "From address used in Zoho Mail API"
  type        = string
}

variable "zoho_api_base_url" {
  description = "Zoho Mail API base URL (e.g. https://mail.zoho.com)"
  type        = string
  default     = "https://mail.zoho.com"
}

variable "secret_name_zoho_token" {
  description = "Name of the Secrets Manager secret that holds the Zoho OAuth access token"
  type        = string
  default     = "magallanes/zoho-oauth-token"
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
