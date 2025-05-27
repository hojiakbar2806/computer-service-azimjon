class DashboardManager {
  constructor() {
    this.user = null
    this.stats = null
    this.init()
  }

  async init() {
    try {
      this.user = await PageInitializer.init("dashboard")
      await this.loadStats()
      await this.renderDashboard()
      await this.loadRequests()
    } catch (error) {
      console.error("Dashboard ishga tushirish xatosi:", error)
      NotificationManager.show("Dashboard yuklanishida xatolik", "error")
    }
  }

  async loadStats() {
    try {
      this.stats = await ApiClient.request("/stats/requests")
    } catch (error) {
      console.log("Statistika yuklashda xatolik:", error)
      this.stats = {
        total_requests: 0,
        pending_requests: 0,
        in_progress_requests: 0,
        completed_requests: 0,
      }
      NotificationManager.show("Statistika vaqtincha mavjud emas", "warning")
    }
  }

  async renderDashboard() {
    this.renderStatsCards()

    if (this.user.role === "manager") {
      await this.renderCharts()
    }
  }

  renderStatsCards() {
    const container = document.getElementById("dashboardContent")
    if (!container) return

    const cards = [
      {
        title: "JAMI SO'ROVLAR",
        value: this.stats.total_requests || 0,
        icon: "fa-clipboard-list",
        color: "primary",
        bgColor: "bg-blue-50",
        iconColor: "text-blue-600",
        borderColor: "border-blue-200",
      },
      {
        title: "KUTILAYOTGAN",
        value: this.stats.pending_requests || 0,
        icon: "fa-hourglass-half",
        color: "warning",
        bgColor: "bg-yellow-50",
        iconColor: "text-yellow-600",
        borderColor: "border-yellow-200",
      },
      {
        title: "JARAYONDA",
        value: this.stats.in_progress_requests || 0,
        icon: "fa-cogs",
        color: "info",
        bgColor: "bg-purple-50",
        iconColor: "text-purple-600",
        borderColor: "border-purple-200",
      },
      {
        title: "TUGALLANGAN",
        value: this.stats.completed_requests || 0,
        icon: "fa-check-circle",
        color: "success",
        bgColor: "bg-green-50",
        iconColor: "text-green-600",
        borderColor: "border-green-200",
      },
    ]

    container.innerHTML = cards
      .map(
        (card) => `
            <div class="card rounded-lg p-6 ${card.bgColor} border ${card.borderColor}">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider">${card.title}</h3>
                        <p class="text-3xl font-bold text-gray-900">${card.value}</p>
                    </div>
                    <div class="w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center border ${card.borderColor}">
                        <i class="fas ${card.icon} ${card.iconColor} text-xl"></i>
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  async renderCharts() {
    const chartContainer = document.getElementById("chartContainer")
    if (!chartContainer) return

    try {
      const [locations, serviceRequests] = await Promise.all([
        ApiClient.request("/stats/locations").catch(() => []),
        ApiClient.request("/service-request").catch(() => []),
      ])

      this.setupChartContainer(chartContainer)

      if (window.Chart) {
        this.renderIssueTypesChart(serviceRequests)
        this.renderLocationChart(locations)
      }
    } catch (error) {
      console.error("Diagramma chizishda xatolik:", error)
      NotificationManager.show("Analitika vaqtincha mavjud emas", "warning")
      chartContainer.innerHTML = ""
    }
  }

  setupChartContainer(container) {
    container.innerHTML = `
            <div class="card rounded-lg p-6">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-semibold text-gray-900 flex items-center">
                        <i class="fas fa-chart-pie text-primary mr-3"></i>
                        Muammo Turlari Analitikasi
                    </h3>
                </div>
                <div class="chart-container" style="position: relative; height: 300px; width: 100%;">
                    <canvas id="issueTypesChart"></canvas>
                </div>
            </div>

            <div class="card rounded-lg p-6">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-semibold text-gray-900 flex items-center">
                        <i class="fas fa-map-marker-alt text-primary mr-3"></i>
                        Joylashuv Ma'lumotlari
                    </h3>
                </div>
                <div class="chart-container" style="position: relative; height: 300px; width: 100%;">
                    <canvas id="locationChart"></canvas>
                </div>
            </div>
        `
  }

  renderIssueTypesChart(serviceRequests) {
    if (!window.Chart) return

    const issueTypeData = Object.values(
      serviceRequests.reduce((acc, issue) => {
        const key = issue.issue_type || "Noma'lum"
        if (!acc[key]) {
          acc[key] = { issue_type: key, count: 0 }
        }
        acc[key].count += 1
        return acc
      }, {}),
    )

    const ctx = document.getElementById("issueTypesChart")
    if (!ctx) return

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: issueTypeData.map((item) => item.issue_type),
        datasets: [
          {
            data: issueTypeData.map((item) => item.count),
            backgroundColor: ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#10b981"],
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#374151",
              padding: 20,
              usePointStyle: true,
              font: { size: 12, weight: "500" },
            },
          },
        },
        cutout: "60%",
      },
    })
  }

  renderLocationChart(locationData) {
    if (!window.Chart) return

    const ctx = document.getElementById("locationChart")
    if (!ctx) return

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: locationData.map((d) => d.source || d.location || "Noma'lum"),
        datasets: [
          {
            label: "So'rovlar",
            data: locationData.map((d) => d.count || 0),
            backgroundColor: "#3b82f6",
            borderColor: "#1e40af",
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            ticks: { color: "#6b7280", font: { size: 11 } },
            grid: { color: "#f3f4f6" },
          },
          y: {
            ticks: { color: "#6b7280", font: { size: 11 } },
            grid: { color: "#f3f4f6" },
            beginAtZero: true,
          },
        },
      },
    })
  }

  async loadRequests() {
    if (window.RequestHandler) {
      const requestHandler = new RequestHandler()
      await requestHandler.displayRequests(this.user)
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new DashboardManager()
})
