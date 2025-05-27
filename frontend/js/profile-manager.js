class ProfileManager {
  constructor() {
    this.user = null
    this.form = document.getElementById("updateProfileForm")
    this.init()
  }

  async init() {
    try {
      this.user = await PageInitializer.init("profile")
      this.displayProfileInfo()
      this.setupFormHandler()
    } catch (error) {
      console.error("Profil sahifasi xatosi:", error)
      NotificationManager.show("Profil yuklanishida xatolik", "error")
    }
  }

  displayProfileInfo() {
    const profileInfo = document.getElementById("profileInfo")
    if (!profileInfo || !this.user) return

    profileInfo.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-1">
                    <label class="text-sm font-medium text-gray-500">Ism</label>
                    <p class="text-gray-900 font-medium">${this.user.firstName || "Ko'rsatilmagan"}</p>
                </div>
                <div class="space-y-1">
                    <label class="text-sm font-medium text-gray-500">Familiya</label>
                    <p class="text-gray-900 font-medium">${this.user.lastName || "Ko'rsatilmagan"}</p>
                </div>
                <div class="space-y-1">
                    <label class="text-sm font-medium text-gray-500">Email</label>
                    <p class="text-gray-900 font-medium">${this.user.email || "Ko'rsatilmagan"}</p>
                </div>
                <div class="space-y-1">
                    <label class="text-sm font-medium text-gray-500">Rol</label>
                    <p class="text-gray-900 font-medium">${this.getRoleName(this.user.role)}</p>
                </div>
                <div class="space-y-1">
                    <label class="text-sm font-medium text-gray-500">Ro'yxatdan o'tgan sana</label>
                    <p class="text-gray-900 font-medium">${Utils.formatDate(this.user.createdAt)}</p>
                </div>
            </div>
        `

    // Populate form fields
    if (this.form) {
      const firstNameField = this.form.querySelector("#firstName")
      const lastNameField = this.form.querySelector("#lastName")

      if (firstNameField) firstNameField.value = this.user.firstName || ""
      if (lastNameField) lastNameField.value = this.user.lastName || ""
    }
  }

  getRoleName(role) {
    const roleNames = {
      user: "Foydalanuvchi",
      manager: "Menejer",
      master: "Usta",
    }
    return roleNames[role] || "Noma'lum"
  }

  setupFormHandler() {
    if (!this.form) return

    this.form.addEventListener("submit", async (event) => {
      event.preventDefault()

      const submitButton = this.form.querySelector('button[type="submit"]')
      const submitText = document.getElementById("submitText")
      const submitLoader = document.getElementById("submitLoader")

      this.setLoadingState(submitButton, submitText, submitLoader, true)

      try {
        const formData = new FormData(this.form)
        const updateData = {
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
        }

        // Only include password if it's provided
        const password = formData.get("password")
        if (password && password.trim()) {
          updateData.password = password
        }

        await this.updateProfile(updateData)

        this.user = await ApiClient.request("/auth/current-user")
        this.displayProfileInfo()

        // Clear password field
        const passwordField = this.form.querySelector("#password")
        if (passwordField) passwordField.value = ""
      } catch (error) {
        NotificationManager.show(error.message || "Profil yangilanishida xatolik", "error")
      } finally {
        this.setLoadingState(submitButton, submitText, submitLoader, false)
      }
    })
  }

  async updateProfile(data) {
    const response = await ApiClient.request("/users-profile", {
      method: "PUT",
      body: JSON.stringify(data),
    })

    NotificationManager.show(response.message || "Profil muvaffaqiyatli yangilandi", "success")
  }

  setLoadingState(button, textElement, loader, isLoading) {
    button.disabled = isLoading
    if (isLoading) {
      textElement.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Yangilanmoqda...'
    } else {
      textElement.innerHTML = '<i class="fas fa-save mr-2"></i>Ma\'lumotlarni Yangilash'
    }
    if (loader) {
      loader.classList.toggle("hidden", !isLoading)
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ProfileManager()
})
