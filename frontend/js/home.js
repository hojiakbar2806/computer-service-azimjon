// Home Page Controller
class HomePageController {
  constructor() {
    this.form = document.getElementById("serviceRequestForm")
    this.init()
  }

  init() {
    if (this.form) {
      this.setupFormHandler()
    }
  }

  setupFormHandler() {
    this.form.addEventListener("submit", async (event) => {
      event.preventDefault()

      const submitButton = this.form.querySelector('button[type="submit"]')
      const submitText = document.getElementById("submitText")
      const submitLoader = document.getElementById("submitLoader")

      // Show loading state
      this.setLoadingState(submitButton, submitText, submitLoader, true)

      try {
        const formData = new FormData(this.form)
        const requestData = Object.fromEntries(formData)

        await this.submitServiceRequest(requestData)
        this.form.reset()

        // Close modal after successful submission
        const closeRepairModal = window.closeRepairModal // Declare the variable
        if (typeof closeRepairModal === "function") {
          closeRepairModal()
        }
      } catch (error) {
        const NotificationManager = window.NotificationManager // Declare the variable
        NotificationManager.show(error.message || "Xizmat so'rovi yuborishda xatolik yuz berdi", "error")
      } finally {
        this.setLoadingState(submitButton, submitText, submitLoader, false)
      }
    })
  }

  async submitServiceRequest(data) {
    const ApiClient = window.ApiClient // Declare the variable
    const response = await ApiClient.request("/service/create", {
      method: "POST",
      body: JSON.stringify(data),
    })

    const NotificationManager = window.NotificationManager // Declare the variable
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
      textElement.innerHTML = "So'rov Yuborish"
    }
    if (loader) {
      loader.classList.toggle("hidden", !isLoading)
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new HomePageController()
})
