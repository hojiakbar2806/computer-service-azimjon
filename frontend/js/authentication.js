// Authentication Controller
class AuthenticationController {
  constructor() {
    this.loginForm = document.getElementById("loginForm")
    this.registerForm = document.getElementById("registerForm")
    this.init()
  }

  init() {
    if (this.loginForm) {
      this.setupLoginHandler()
    }

    if (this.registerForm) {
      this.setupRegisterHandler()
    }
  }

  setupLoginHandler() {
    this.loginForm.addEventListener("submit", async (event) => {
      event.preventDefault()

      const submitButton = this.loginForm.querySelector('button[type="submit"]')
      const submitText = document.getElementById("submitText")
      const submitLoader = document.getElementById("submitLoader")

      this.setLoadingState(submitButton, submitText, submitLoader, true, "Kirilmoqda...")

      try {
        const formData = new FormData(this.loginForm)
        const credentials = {
          email: formData.get("email"),
          password: formData.get("password"),
        }

        const response = await window.ApiClient.request("/auth/login", {
          method: "POST",
          body: JSON.stringify(credentials),
        })

        window.NotificationManager.show(response.message || "Muvaffaqiyatli kirildi", "success")

        // Redirect after short delay
        setTimeout(() => {
          window.location.href = "dashboard.html"
        }, 1000)
      } catch (error) {
        window.NotificationManager.show(error.message || "Kirish amalga oshmadi", "error")
      } finally {
        this.setLoadingState(submitButton, submitText, submitLoader, false, "Kirish")
      }
    })
  }

  setupRegisterHandler() {
    const entityTypeSelect = document.getElementById("entityType");
    const companyNameField = document.getElementById("companyNameField");
  
    entityTypeSelect.addEventListener("change", () => {
      if (entityTypeSelect.value === "legal") {
        companyNameField.classList.remove("hidden");
      } else {
        companyNameField.classList.add("hidden");
      }
    });
  
    this.registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
  
      const submitButton = this.registerForm.querySelector('button[type="submit"]');
      const submitText = document.getElementById("submitText");
      const submitLoader = document.getElementById("submitLoader");
  
      this.setLoadingState(submitButton, submitText, submitLoader, true, "Yaratilmoqda...");
  
      try {
        const formData = new FormData(this.registerForm);
        const entityType = formData.get("entityType");
  
        const userData = {
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: formData.get("email"),
          password: formData.get("password"),
        };
  
        // Agar yuridik shaxs bo‘lsa, qo‘shimcha ma’lumotlarni qo‘shamiz
        if (entityType === "legal") {
          userData.isLegalEntity = true;
          userData.companyName = formData.get("companyName") || "";
        }
  
        const response = await window.ApiClient.request("/auth/register", {
          method: "POST",
          body: JSON.stringify(userData),
        });
  
        window.NotificationManager.show(response.message || "Hisob muvaffaqiyatli yaratildi", "success");
  
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } catch (error) {
        window.NotificationManager.show(error.message || "Hisob yaratishda xatolik", "error");
      } finally {
        this.setLoadingState(submitButton, submitText, submitLoader, false, "Hisob Yaratish");
      }
    });
  }
  

  setLoadingState(button, textElement, loader, isLoading, text) {
    button.disabled = isLoading
    if (isLoading) {
      textElement.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>${text}`
    } else {
      textElement.innerHTML = text
    }
    if (loader) {
      loader.classList.toggle("hidden", !isLoading)
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new AuthenticationController()
})
