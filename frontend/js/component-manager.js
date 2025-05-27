class ComponentManager {
  constructor() {
    this.user = null
    this.components = []
    this.form = document.getElementById("componentForm")
    this.modal = document.getElementById("componentModal")
    this.init()
  }

  async init() {
    try {
      const PageInitializer = window.PageInitializer
      this.user = await PageInitializer.init("components")

      if (this.user.role !== "manager" && this.user.role !== "master") {
        const NotificationManager = window.NotificationManager
        NotificationManager.show("Ruxsat rad etildi. Faqat menejer va ustalar kirishi mumkin", "error")
        window.location.href = "dashboard.html"
        return
      }

      this.setupFormHandler()
      await this.loadComponents()
    } catch (error) {
      console.error("Komponentlar sahifasi xatosi:", error)
      const NotificationManager = window.NotificationManager
      NotificationManager.show("Sahifa yuklanishida xatolik", "error")
    }
  }

  setupFormHandler() {
    if (!this.form) return

    this.form.addEventListener("submit", async (event) => {
      event.preventDefault()

      const submitButton = this.form.querySelector('button[type="submit"]')
      const submitText = document.getElementById("componentSubmitText")
      const submitLoader = document.getElementById("componentSubmitLoader")

      this.setLoadingState(submitButton, submitText, submitLoader, true)

      try {
        const formData = new FormData(this.form)
        const componentData = {
          name: formData.get("name"),
          type: formData.get("type"),
          price: Number.parseFloat(formData.get("price")),
          quantity: Number.parseInt(formData.get("quantity")),
          description: formData.get("description"),
        }

        await this.createComponent(componentData)
        this.form.reset()
        this.hideCreateModal()
        await this.loadComponents()
      } catch (error) {
        const NotificationManager = window.NotificationManager
        NotificationManager.show(error.message || "Komponent qo'shishda xatolik", "error")
      } finally {
        this.setLoadingState(submitButton, submitText, submitLoader, false)
      }
    })
  }

  async createComponent(data) {
    const ApiClient = window.ApiClient
    const response = await ApiClient.request("/components", {
      method: "POST",
      body: JSON.stringify(data),
    })

    const NotificationManager = window.NotificationManager
    NotificationManager.show(response.message || "Komponent muvaffaqiyatli qo'shildi", "success")
  }

  showCreateModal() {
    if (this.modal) {
      this.modal.classList.add("show")
      this.modal.style.display = "flex"
      document.body.style.overflow = "hidden"
    }
  }

  hideCreateModal() {
    if (this.modal) {
      this.modal.classList.remove("show")
      this.modal.style.display = "none"
      document.body.style.overflow = "auto"
      if (this.form) {
        this.form.reset()
      }
    }
  }

  setLoadingState(button, textElement, loader, isLoading) {
    button.disabled = isLoading
    if (isLoading) {
      textElement.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Qo\'shilmoqda...'
    } else {
      textElement.innerHTML = '<i class="fas fa-plus mr-2"></i>Qo\'shish'
    }
    if (loader) {
      loader.classList.toggle("hidden", !isLoading)
    }
  }

  async loadComponents() {
    const componentsList = document.getElementById("componentsList")
    if (!componentsList) return

    try {
      const ApiClient = window.ApiClient
      this.components = await ApiClient.request("/components")

      if (this.components.length === 0) {
        this.renderEmptyState(componentsList)
        return
      }

      this.renderComponentsTable(componentsList)
    } catch (error) {
      console.error("Komponentlarni yuklashda xatolik:", error)
      const NotificationManager = window.NotificationManager
      NotificationManager.show("Komponentlarni yuklashda xatolik", "error")
      this.renderErrorState(componentsList)
    }
  }

  renderEmptyState(container) {
    container.innerHTML = `
            <div class="text-center py-12">
                <div class="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-boxes text-gray-400 text-3xl"></i>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Komponentlar topilmadi</h3>
                <p class="text-gray-600 mb-6">Hozircha hech qanday komponent qo'shilmagan.</p>
                <button onclick="componentManager.showCreateModal()" class="btn-primary px-6 py-3 rounded-lg font-medium">
                    <i class="fas fa-plus mr-2"></i>Birinchi Komponent Qo'shish
                </button>
            </div>
        `
  }

  renderErrorState(container) {
    container.innerHTML = `
            <div class="text-center py-12">
                <div class="w-20 h-20 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-6 border border-red-200">
                    <i class="fas fa-exclamation-circle text-red-400 text-3xl"></i>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Yuklashda Xatolik</h3>
                <p class="text-gray-600">Iltimos, keyinroq qayta urinib ko'ring.</p>
            </div>
        `
  }

  renderComponentsTable(container) {
    container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="text-gray-700 border-b border-gray-200 bg-gray-50">
                            <th class="p-4 font-semibold">Nomi</th>
                            <th class="p-4 font-semibold">Turi</th>
                            <th class="p-4 font-semibold">Narxi</th>
                            <th class="p-4 font-semibold">Miqdor</th>
                            <th class="p-4 font-semibold">Holat</th>
                            <th class="p-4 font-semibold">Qo'shilgan sana</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.components.map((component) => this.renderComponentRow(component)).join("")}
                    </tbody>
                </table>
            </div>
        `
  }

  renderComponentRow(component) {
    const Utils = window.Utils
    return `
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td class="p-4">
                    <div class="font-medium text-gray-900">${component.name || "Noma'lum"}</div>
                    <div class="text-sm text-gray-500">${component.description || ""}</div>
                </td>
                <td class="p-4">
                    <span class="text-sm text-gray-900">${this.getTypeLabel(component.type)}</span>
                </td>
                <td class="p-4">
                    <span class="text-sm font-medium text-gray-900">${component.price ? component.price.toLocaleString() + " so'm" : "Ko'rsatilmagan"}</span>
                </td>
                <td class="p-4">
                    <span class="text-sm text-gray-900">${component.quantity || 0}</span>
                </td>
                <td class="p-4">
                    ${this.getStockStatus(component.quantity)}
                </td>
                <td class="p-4">
                    <span class="text-sm text-gray-500">${Utils.formatDate(component.createdAt)}</span>
                </td>

            </tr>
        `
  }

  getTypeLabel(type) {
    const typeLabels = {
      screen: "Ekran",
      battery: "Batareya",
      camera: "Kamera",
      speaker: "Dinamik",
      microphone: "Mikrofon",
      charging_port: "Quvvat Porti",
      motherboard: "Anakart",
      memory: "Xotira",
      other: "Boshqa",
    }
    return typeLabels[type] || type || "Ko'rsatilmagan"
  }

  getStockStatus(quantity) {
    if (quantity === 0) {
      return '<span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">Tugagan</span>'
    } else if (quantity < 10) {
      return '<span class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Kam</span>'
    } else {
      return '<span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">Mavjud</span>'
    }
  }

}

window.ComponentManager = ComponentManager
window.componentManager = new ComponentManager()

window.showCreateComponent = () => {
  if (window.componentManager) {
    window.componentManager.showCreateModal()
  }
}

document.addEventListener("DOMContentLoaded", () => {
})


function hideComponentModal() {
  const modal = document.getElementById('componentModal');
  const form = document.getElementById('componentForm');
  if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
  }
  if (form) {
      form.reset();
  }
}
