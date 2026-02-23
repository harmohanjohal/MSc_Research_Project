variable "resource_group_name" {
  type        = string
  description = "Name of the resource group"
  default     = "terra-core-rg-v2"
}

variable "location" {
  type        = string
  description = "Azure region to deploy resources (e.g. norwayeast)"
  default     = "norwayeast"
}

variable "vm_size" {
  type        = string
  description = "Size of the VM (B2ats_v2 is free tier eligible for this subscription)"
  default     = "Standard_B2ats_v2"
}

variable "admin_username" {
  type        = string
  description = "Admin username for the VM"
  default     = "azureuser"
}

variable "ssh_public_key" {
  type        = string
  description = "Path to the SSH public key for VM authentication"
  default     = "~/.ssh/id_rsa.pub"
}
