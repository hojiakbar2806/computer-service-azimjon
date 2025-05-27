class StaffManager {
  constructor() {
    this.user = null
    this.staff = []
    this.init()
  }

  async init() {
    try {
      this.user = await PageInitializer.init("staff")

      if (this.user.role !== "manager") {
        NotificationManager.show("Ruxsat rad etildi. Faqat menejerlar kirishi mumkin", "error")
        window.location.href = "dashboard.html"
        return
      }

      await this.loadStaff()
    } catch (error) {
      console.error("Xodimlar sahifasi xatosi:", error)
      NotificationManager.show("Sahifa yuklanishida xatolik", "error")
    }
  }

  async loadStaff() {
    const staffList = document.getElementById("staffList")
    if (!staffList) return

    try {
      this.staff = await ApiClient.request("/users")

      if (this.staff.length === 0) {
        this.renderEmptyState(staffList)
        return
      }

      this.renderStaffTable(staffList)
    } catch (error) {
      console.error("Xodimlarni yuklashda xatolik:", error)
      NotificationManager.show("Xodimlarni yuklashda xatolik", "error")
      this.renderErrorState(staffList)
    }
  }

  renderEmptyState(container) {
    container.innerHTML = `
            <div class="text-center py-12">
                <div class="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-users text-gray-400 text-3xl"></i>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Xodimlar topilmadi</h3>
                <p class="text-gray-600">Hozircha hech qanday xodim qo'shilmagan.</p>
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

  renderStaffTable(container) {
    container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="text-gray-700 border-b border-gray-200 bg-gray-50">
                            <th class="p-4 font-semibold">Ism</th>
                            <th class="p-4 font-semibold">Email</th>
                            <th class="p-4 font-semibold">Rol</th>
                            <th class="p-4 font-semibold">Qo'shilgan sana</th>
                            <th class="p-4 font-semibold">Holat</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.staff.map((member) => this.renderStaffRow(member)).join("")}
                    </tbody>
                </table>
            </div>
        `
  }

  renderStaffRow(member) {
    return `
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td class="p-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-user text-gray-600 text-sm"></i>
                        </div>
                        <div>
                            <div class="font-medium text-gray-900">${member.firstName || ""} ${member.lastName || ""}</div>
                        </div>
                    </div>
                </td>
                <td class="p-4">
                    <span class="text-sm text-gray-900">${member.email || "Ko'rsatilmagan"}</span>
                </td>
                <td class="p-4">
                    ${this.getRoleBadge(member.role)}
                    ${member.isLegalEntity ? `<span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200 ml-2">Yuridik shaxs</span>` : ""}
                </td>
                <td class="p-4">
                    <span class="text-sm text-gray-500">${Utils.formatDate(member.createdAt)}</span>
                </td>
                <td class="p-4">
                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">Faol</span>
                </td>
            </tr>
        `
  }

  getRoleBadge(role) {
    const roleConfig = {
      user: { class: "bg-blue-100 text-blue-800 border-blue-200", text: "Foydalanuvchi" },
      manager: { class: "bg-purple-100 text-purple-800 border-purple-200", text: "Menejer" },
      master: { class: "bg-green-100 text-green-800 border-green-200", text: "Usta" },
    }

    const config = roleConfig[role] || roleConfig.user
    return `<span class="px-2 py-1 text-xs font-medium rounded-full ${config.class} border">${config.text}</span>`
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new StaffManager()
})
