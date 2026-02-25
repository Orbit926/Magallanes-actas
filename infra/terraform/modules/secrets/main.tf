resource "aws_secretsmanager_secret" "zoho_token" {
  name        = var.secret_name
  description = "Zoho OAuth access token for ${var.project_name}-${var.environment}"

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# NOTE: The actual secret VALUE is NOT managed by Terraform.
# After `terraform apply`, set the value with:
#
#   aws secretsmanager put-secret-value \
#     --secret-id <secret_name> \
#     --secret-string '{"access_token":"YOUR_ZOHO_OAUTH_TOKEN"}' \
#     --profile <your_profile>
