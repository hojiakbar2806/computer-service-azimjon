const AppConfig = {
  API_BASE: "https://azimjon.robohouse.tech/api",
  NOTIFICATION_TIMEOUT: 5000,
  CHART_COLORS: {
    primary: "#1e40af",
    secondary: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    accent: "#06b6d4",
  },
}

class NotificationManager {
  static show(message, type = "info") {
  
    document.querySelectorAll(".notification-popup").forEach((n) => n.remove())

    const notification = document.createElement("div")
    notification.className = `notification-popup fixed top-6 right-6 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${this.getTypeClasses(type)}`

    notification.innerHTML = `
            <div class="flex items-center">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${this.getIconBg(type)}">
                    <i class="fas ${this.getIcon(type)} text-white text-sm"></i>
                </div>
                <div class="flex-1">
                    <p class="font-medium text-gray-900">${message}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `

    document.body.appendChild(notification)

  
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.transform = "translateX(100%)"
        setTimeout(() => notification.remove(), 300)
      }
    }, AppConfig.NOTIFICATION_TIMEOUT)
  }

  static getTypeClasses(type) {
    const classes = {
      success: "bg-green-50 border border-green-200",
      error: "bg-red-50 border border-red-200",
      warning: "bg-yellow-50 border border-yellow-200",
      info: "bg-blue-50 border border-blue-200",
    }
    return classes[type] || classes.info
  }

  static getIconBg(type) {
    const classes = {
      success: "bg-green-500",
      error: "bg-red-500",
      warning: "bg-yellow-500",
      info: "bg-blue-500",
    }
    return classes[type] || classes.info
  }

  static getIcon(type) {
    const icons = {
      success: "fa-check",
      error: "fa-exclamation",
      warning: "fa-exclamation-triangle",
      info: "fa-info",
    }
    return icons[type] || icons.info
  }
}

class ApiClient {
  static async request(endpoint, options = {}) {
    const config = {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    }

    try {
      const response = await fetch(`${AppConfig.API_BASE}${endpoint}`, config)

      if (response.status === 401) {
        window.location.href = "index.html"
        NotificationManager.show("Autentifikatsiya xatosi. Iltimos, qaytadan kiring.", "error")
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP Xatosi! Status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error("API So'rov Xatosi:", error)
      throw error
    }
  }
}

class NavigationManager {
  static routes = {
    user: [
      { href: "dashboard.html", icon: "fa-tachometer-alt", text: "Boshqaruv Paneli" },
      { href: "create-request.html", icon: "fa-plus-circle", text: "Yangi So'rov" },
      { href: "profile.html", icon: "fa-user", text: "Profil" },
    ],
    manager: [
      { href: "dashboard.html", icon: "fa-tachometer-alt", text: "Boshqaruv Paneli" },
      { href: "staff.html", icon: "fa-users", text: "Xodimlar" },
      { href: "components.html", icon: "fa-cogs", text: "Komponentlar" },
      { href: "profile.html", icon: "fa-user", text: "Profil" },
    ],
    master: [
      { href: "dashboard.html", icon: "fa-tachometer-alt", text: "Boshqaruv Paneli" },
      { href: "components.html", icon: "fa-cogs", text: "Komponentlar" },
      { href: "profile.html", icon: "fa-user", text: "Profil" },
    ],
  }

  static render(role, activePage) {
    const sidebarNav = document.getElementById("sidebarNav")
    if (!sidebarNav) return

    const links = this.routes[role] || this.routes.user

    sidebarNav.innerHTML = links
      .map(
        (link) => `
            <a href="${link.href}" class="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ${activePage === link.href.split(".")[0] ? "text-primary bg-blue-50 border-r-2 border-primary" : ""}">
                <i class="fas ${link.icon} mr-3"></i>
                <span class="font-medium">${link.text}</span>
            </a>
        `,
      )
      .join("")
  }
}

class PageInitializer {
  static async init(pageName) {
    try {
      const user = await ApiClient.request("/auth/current-user")
      const role = user.role || "user"

    
      this.updateUserInfo(user)

    
      NavigationManager.render(role, pageName)

      return user
    } catch (error) {
      console.error("Sahifa ishga tushirish xatosi:", error)
      throw error
    }
  }

  static updateUserInfo(user) {
    const userWelcome = document.getElementById("userWelcome")
    const userRole = document.getElementById("userRole")

    if (userWelcome) {
      userWelcome.textContent = `${user.firstName || "Foydalanuvchi"}`
    }

    if (userRole) {
      const roleNames = {
        user: "FOYDALANUVCHI",
        manager: "MENEJER",
        master: "USTA",
      }
      if (user.role==="user"&&user.isLegalEntity) {
        userRole.textContent = "Yuridik shaxs"
      }
      else{
        userRole.textContent = roleNames[user.role]
      }
    }
  }
}

class Utils {
  static formatDate(dateString) {
    if (!dateString) return "Ma'lumot yo'q"
    return new Date(dateString).toLocaleString("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  static getStatusBadge(status) {
    const statusMap = {
      pending: { class: "bg-yellow-100 text-yellow-800 border border-yellow-200", text: "Kutilmoqda" },
      in_progress: { class: "bg-blue-100 text-blue-800 border border-blue-200", text: "Jarayonda" },
      completed: { class: "bg-green-100 text-green-800 border border-green-200", text: "Tugallangan" },
      approved: { class: "bg-purple-100 text-purple-800 border border-purple-200", text: "Tasdiqlangan" },
      in_review: { class: "bg-yellow-100 text-yellow-800 border border-yellow-200", text: "Ko'rib chiqilmoqda" },
    }

    const statusInfo = statusMap[status?.toLowerCase()] || {
      class: "bg-gray-100 text-gray-800 border border-gray-200",
      text: "Noma'lum",
    }

    return `<span class="px-2 py-1 text-xs font-medium rounded-full ${statusInfo.class}">${statusInfo.text}</span>`
  }

  static scrollToSection(sectionId) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
  }
}

class AuthManager {
  static async logout() {
    try {
      await ApiClient.request("/auth/logout", { method: "POST" })
      window.location.href = "index.html"
    } catch (error) {
      NotificationManager.show("Chiqish amalga oshmadi", "error")
    }
  }
}

window.showNotification = (message, type) => NotificationManager.show(message, type)
window.api = (endpoint, options) => ApiClient.request(endpoint, options)
window.initPage = (pageName) => PageInitializer.init(pageName)
window.logout = () => AuthManager.logout()
window.formatDate = (date) => Utils.formatDate(date)
window.getStatusColor = (status) => Utils.getStatusBadge(status)
window.scrollToSection = (id) => Utils.scrollToSection(id)

window.NotificationManager = NotificationManager
window.ApiClient = ApiClient
window.NavigationManager = NavigationManager
window.PageInitializer = PageInitializer
window.Utils = Utils
window.AuthManager = AuthManager
