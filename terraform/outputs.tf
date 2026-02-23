output "server_public_ip" {
  value       = azurerm_public_ip.public_ip.ip_address
  description = "The public IP address of the Terra-Core Server"
}

output "ssh_command" {
  value       = "ssh ${var.admin_username}@${azurerm_public_ip.public_ip.ip_address}"
  description = "Command to SSH into the newly created server"
}
