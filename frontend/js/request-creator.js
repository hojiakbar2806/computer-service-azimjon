class RequestCreator {
  constructor() {
    this.form = document.getElementById("dashboardServiceRequestForm")
    this.user = null
    this.init()
  }

  async init() {
    try {
      this.user = await PageInitializer.init("create-request")
      this.populateUserData()
      this.setupFormHandler()
    } catch (error) {
      console.error("So'rov yaratish sahifasi xatosi:", error)
      NotificationManager.show("Sahifa yuklanishida xatolik", "error")
    }
  }

  populateUserData() {
    if (this.user) {
      const fullNameField = document.getElementById("fullName")
      const emailField = document.getElementById("email")

      if (fullNameField) {
        fullNameField.value = `${this.user.firstName || ""} ${this.user.lastName || ""}`.trim()
      }

      if (emailField) {
        emailField.value = this.user.email || ""
      }
    }
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
        const requestData = {
          fullName: formData.get("fullName") || `${this.user.firstName || ""} ${this.user.lastName || ""}`.trim(),
          email: formData.get("email") || this.user.email,
          device_model: formData.get("device_model"),
          issue_type: formData.get("issue_type"),
          problem_area: formData.get("problem_area"),
          location: formData.get("location"),
          description: formData.get("description"),
        }

        await this.submitServiceRequest(requestData)
        this.form.reset()

        // Redirect to dashboard after successful submission
        setTimeout(() => {
          window.location.href = "dashboard.html"
        }, 2000)
      } catch (error) {
        NotificationManager.show(error.message || "So'rov yuborishda xatolik", "error")
      } finally {
        this.setLoadingState(submitButton, submitText, submitLoader, false)
      }
    })
  }

  async submitServiceRequest(data) {
    const response = await ApiClient.request("/service/create", {
      method: "POST",
      body: JSON.stringify(data),
    })

    NotificationManager.show(
      response.message || "Xizmat so'rovi muvaffaqiyatli yuborildi! 24 soat ichida siz bilan bog'lanamiz.",
      "success",
    )
  }

  setLoadingState(button, textElement, loader, isLoading) {
    button.disabled = isLoading
    if (isLoading) {
      textElement.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Yuborilmoqda...'
    } else {
      textElement.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>So\'rov Yuborish'
    }
    if (loader) {
      loader.classList.toggle("hidden", !isLoading)
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new RequestCreator()
})
