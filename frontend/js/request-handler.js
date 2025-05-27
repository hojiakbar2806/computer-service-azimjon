function initializeRequestHandler() {
  // Store requests data and user locally within the closure
  let requestsData = [];
  let componentsData = [];
  let currentUser = null; // Store user object

  async function fetchComponents() {
    try {
      componentsData = await window.ApiClient.request("/components");
      if (!Array.isArray(componentsData)) {
        componentsData = [];
        window.NotificationManager.show("Komponentlar ro'yxati mavjud emas", "warning");
      }
    } catch (error) {
      console.error("Error fetching components:", error);
      componentsData = [];
      window.NotificationManager.show("Komponentlarni yuklashda xatolik", "error");
    }
  }

  async function displayRequests(user) {
    currentUser = user; // Store user in closure
    const requestsList = document.getElementById("requestsList");
    if (!requestsList) {
      window.NotificationManager.show("So'rovlar ro'yxati topilmadi", "error");
      return;
    }

    try {
      requestsData = await window.ApiClient.request("/service-request");
      if (requestsData.length === 0) {
        renderEmptyState(requestsList, user);
        return;
      }
      renderRequestsTable(requestsList, requestsData, user);
    } catch (error) {
      window.NotificationManager.show("So'rovlarni yuklashda xatolik", "error");
      renderErrorState(requestsList);
    }
  }

  function renderEmptyState(container, user) {
    container.innerHTML = `
      <div class="text-center py-8">
        <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-inbox text-gray-400 text-2xl"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">So'rovlar topilmadi</h3>
        <p class="text-gray-600 mb-4">${user.role === "user" ? "Siz hali hech qanday xizmat so'rovi yubormagansiz." : "Hozircha hech qanday so'rov mavjud emas."}</p>
        ${user.role === "user" ? `
          <a href="create-request.html" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center">
            <i class="fas fa-plus mr-2"></i>Birinchi So'rov Yaratish
          </a>
        ` : ""}
      </div>
    `;
  }

  function renderErrorState(container) {
    container.innerHTML = `
      <div class="text-center py-8">
        <div class="w-16 h-16 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-4 border border-red-200">
          <i class="fas fa-exclamation-circle text-red-400 text-2xl"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Yuklashda Xatolik</h3>
        <p class="text-gray-600">Iltimos, keyinroq qayta urinib ko'ring.</p>
      </div>
    `;
  }

  function renderRequestsTable(container, requests, user) {
    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left bg-white rounded-lg shadow-md">
          <thead>
            <tr class="text-gray-700 border-b border-gray-200 bg-gray-50">
              <th class="p-4 font-semibold text-sm text-gray-800">Qurilma</th>
              ${user.role !== "user" ? '<th class="p-4 font-semibold text-sm text-gray-800">Mijoz</th>' : ""}
              <th class="p-4 font-semibold text-sm text-gray-800">Muammo</th>
              <th class="p-4 font-semibold text-sm text-gray-800">Joylashuv</th>
              <th class="p-4 font-semibold text-sm text-gray-800">Holat</th>
              <th class="p-4 font-semibold text-sm text-gray-800">Sana</th>
              <th class="p-4 font-semibold text-sm text-gray-800">Amallar</th>
            </tr>
          </thead>
          <tbody>
            ${requests.map((request, index) => renderRequestRow(request, user, index)).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderRequestRow(request, user, index) {
    return `
      <tr class="border-b border-gray-200 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-gray-50 transition-all duration-200 transform hover:scale-[1.01] shadow-sm">
        <td class="p-4">
          <div class="flex flex-col">
            <div class="font-semibold text-gray-800 text-sm">${request.device_model || "Noma'lum Qurilma"}</div>
            <div class="text-xs text-gray-500 mt-1">${request.issue_type || "Tur ko'rsatilmagan"}</div>
          </div>
        </td>
        ${user.role !== "user" ? `
          <td class="p-4">
            <div class="flex flex-col">
              <div class="font-semibold text-gray-800 text-sm">${request.owner?.firstName || "Noma'lum"} ${request.owner?.lastName || ""}</div>
              <div class="text-xs text-gray-500 mt-1">${request.owner?.email || ""}</div>
            </div>
          </td>
        ` : ""}
        <td class="p-4">
          <div class="flex flex-col">
            <div class="text-sm text-gray-800 max-w-xs truncate" title="${request.description || "Tavsif yo'q"}">
              ${request.description || "Tavsif yo'q"}
            </div>
            ${request.problem_area ? `<div class="text-xs text-gray-500 mt-1">${request.problem_area}</div>` : ""}
          </div>
        </td>
        <td class="p-4">
          <span class="text-sm text-gray-800">${request.location || "Ko'rsatilmagan"}</span>
        </td>
        <td class="p-4">
          <div class="whitespace-nowrap">
            ${window.Utils.getStatusBadge(request.status)}
          </div>
        </td>
        <td class="p-4">
          <span class="text-xs text-gray-600 whitespace-nowrap">${window.Utils.formatDate(request.createdAt)}</span>
        </td>
        <td class="p-4">
          <div class="flex items-center space-x-2 whitespace-nowrap">
            ${getActionButtons(user, request, index)}
          </div>
        </td>
      </tr>
    `;
  }

  function getActionButtons(user, request, index) {
    if (user.role === "user" && request.status === "approved") {
      return `
        <button onclick="window.requestHandler.acknowledgeRequest('${request._id}')" 
                class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium">
          <i class="fas fa-check mr-1"></i>Tasdiqlash
        </button>
      `;
    } else if (user.role === "manager" && request.status === "pending") {
      return `
        <button onclick="window.requestHandler.approveRequest('${request._id}')" 
                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium">
          <i class="fas fa-paper-plane mr-1"></i>Send to Master
        </button>
      `;
    } else if (user.role === "master" && request.status === "in_review") {
      return `
        <button onclick="window.requestHandler.showUpdateModal(${index})" 
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-sm font-medium">
          <i class="fas fa-edit mr-1"></i>Update
        </button>
      `;
    }
    return `<span class="text-gray-400 text-sm">-</span>`;
  }

  async function showUpdateModal(index) {
    const request = requestsData[index];
    if (!request) {
      window.NotificationManager.show("So'rov ma'lumotlari topilmadi", "error");
      return;
    }

    if (!currentUser) {
      window.NotificationManager.show("Foydalanuvchi ma'lumotlari topilmadi", "error");
      return;
    }

    try {
      await fetchComponents();
      renderUpdateModal(request);
      const modal = document.getElementById("updateRequestModal");
      if (modal) {
        modal.classList.add("show");
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
      } else {
        window.NotificationManager.show("Modal topilmadi", "error");
      }
    } catch (error) {
      console.error("Error in showUpdateModal:", error);
      window.NotificationManager.show("So'rovni yangilashda xatolik", "error");
    }
  }

  function renderUpdateModal(request) {
    const container = document.getElementById("updateRequestContent");
    if (!container) {
      console.error("Update request container not found");
      window.NotificationManager.show("Yangilash konteyneri topilmadi", "error");
      return;
    }

    const modalHtml = `
      <div class="space-y-4 max-w-md mx-auto p-5 bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl border border-gray-100 animate-fade-in">
        <div class="bg-gradient-to-r from-indigo-100 to-blue-100 p-4 rounded-t-2xl flex items-center space-x-2">
          <i class="fas fa-edit text-indigo-600 text-lg"></i>
          <h3 class="text-lg font-bold text-gray-900">So'rovni Yangilash</h3>
        </div>
        <form id="updateRequestForm" class="space-y-4 px-4">
          <input type="hidden" name="requestId" value="${request._id}">
          <div>
            <label for="componentId" class="flex items-center text-xs font-semibold text-gray-700 mb-1">
              <i class="fas fa-cogs mr-1 text-gray-500"></i>Komponent
            </label>
            <select id="componentId" name="componentId" required
                    class="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white shadow-sm p-2">
              <option value="">Komponent tanlang</option>
              ${componentsData.map(component => `
                <option value="${component._id}">${component.name}</option>
              `).join("")}
            </select>
          </div>
          <div>
            <label for="quantity" class="flex items-center text-xs font-semibold text-gray-700 mb-1">
              <i class="fas fa-sort-numeric-up mr-1 text-gray-500"></i>Miqdor
            </label>
            <input type="number" id="quantity" name="quantity" min="1" value="1" required
                   class="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white shadow-sm p-2">
          </div>
          <div>
            <label for="price" class="flex items-center text-xs font-semibold text-gray-700 mb-1">
              <i class="fas fa-money-bill mr-1 text-gray-500"></i>Narx (so'm)
            </label>
            <input type="number" id="price" name="price" min="0" step="1" required
                   class="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white shadow-sm p-2">
          </div>
          <div>
            <label for="endTime" class="flex items-center text-xs font-semibold text-gray-700 mb-1">
              <i class="fas fa-calendar-alt mr-1 text-gray-500"></i>Tugash Sanasi
            </label>
            <input type="datetime-local" id="endTime" name="endTime" required
                   class="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white shadow-sm p-2">
          </div>
          <div class="flex space-x-2 pt-2">
            <button type="submit" 
                    class="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-1.5 rounded-md font-medium text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
              <i class="fas fa-save mr-1"></i>Saqlash
            </button>
            <button type="button" onclick="window.requestHandler.hideUpdateModal()" 
                    class="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-1.5 rounded-md font-medium text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
              <i class="fas fa-times mr-1"></i>Bekor qilish
            </button>
          </div>
        </form>
      </div>
    `;
    container.innerHTML = modalHtml;

    const form = document.getElementById("updateRequestForm");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        saveComponents();
      });
    }
  }

  function hideUpdateModal() {
    const modal = document.getElementById("updateRequestModal");
    if (modal) {
      modal.classList.remove("show");
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  }

  async function approveRequest(requestId) {
    try {
      await window.ApiClient.request(`/service/send/${requestId}`, {
        method: "POST",
        body: JSON.stringify({ requestId }),
      });
      window.NotificationManager.show("So'rov muvaffaqiyatli tasdiqlandi", "success");
      location.reload();
    } catch (error) {
      window.NotificationManager.show(error.message || "So'rovni tasdiqlashda xatolik", "error");
    }
  }

  async function acknowledgeRequest(requestId) {
    try {
      await window.ApiClient.request("/service-request/status/update", {
        method: "PUT",
        body: JSON.stringify({ requestId }),
      });
      window.NotificationManager.show("So'rov muvaffaqiyatli tasdiqlandi", "success");
      location.reload();
    } catch (error) {
      window.NotificationManager.show(error.message || "So'rovni tasdiqlashda xatolik", "error");
    }
  }

  async function saveComponents() {
    const form = document.getElementById("updateRequestForm");
    if (!form) {
      window.NotificationManager.show("Yangilash formasi topilmadi", "error");
      return;
    }

    const formData = new FormData(form);
    const requestId = formData.get("requestId");
    const componentId = formData.get("componentId");
    const quantity = parseInt(formData.get("quantity"));
    const price = parseFloat(formData.get("price"));
    const endTime = formData.get("endTime");

    if (!requestId || !componentId || !quantity || !price || !endTime) {
      window.NotificationManager.show("Barcha maydonlarni to'ldiring", "error");
      return;
    }

    if (quantity < 1 || price < 0) {
      window.NotificationManager.show("Miqdor va narx musbat bo'lishi kerak", "error");
      return;
    }

    const payload = {
      requestId,
      price,
      finishedAt: new Date(endTime).toISOString(),
      components: [{ componentId, quantity }],
    };

    try {
      await window.ApiClient.request(`/service-request/update`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      window.NotificationManager.show("So'rov muvaffaqiyatli yangilandi", "success");
      hideUpdateModal();
      location.reload();
    } catch (error) {
      window.NotificationManager.show(error.message || "So'rovni yangilashda xatolik", "error");
    }
  }

  window.requestHandler = {
    displayRequests,
    showUpdateModal,
    approveRequest,
    acknowledgeRequest,
    saveComponents,
    hideUpdateModal,
  };
}

initializeRequestHandler();