variable "project_name" {
  description = "Project identifier for naming"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "secret_arn" {
  description = "ARN of the Secrets Manager secret the Lambda needs to read"
  type        = string
}
