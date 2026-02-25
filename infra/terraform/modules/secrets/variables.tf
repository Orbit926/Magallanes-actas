variable "project_name" {
  description = "Project identifier for naming"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "secret_name" {
  description = "Name of the Secrets Manager secret"
  type        = string
}
