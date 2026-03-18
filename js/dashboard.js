// === LOAD AND DISPLAY DCP MONITOR DATA ===
function loadDCPMonitor() {
  // Get inventory data
  const inventory = JSON.parse(localStorage.getItem("inventoryData")) || [];
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  const history = JSON.parse(localStorage.getItem("history")) || [];

  // Calculate totals
  let totalItems = 0;
  let borrowedCount = 0;
  let lowStockCount = 0;

  inventory.forEach(item => {
    totalItems += item.codes.length;
    if (item.codes.length > 0 && item.codes.length <= 5) {
      lowStockCount++;
    }
  });

  // Get borrowed count from transactions
  borrowedCount = transactions.length;

  // Update overview cards
  document.getElementById("totalItems").textContent = totalItems;
  document.getElementById("borrowedCount").textContent = borrowedCount;
  document.getElementById("lowStockCount").textContent = lowStockCount;
  document.getElementById("transactionCount").textContent = history.length;

  // Render DCP items grid
  const dcpGrid = document.getElementById("dcpItemsGrid");
  dcpGrid.innerHTML = "";

  inventory.forEach(item => {
    const count = item.codes.length;
    const div = document.createElement("div");
    div.className = "dcp-item-card";

    // Determine stock status
    if (count === 0) {
      div.classList.add("out-of-stock");
    } else if (count <= 5) {
      div.classList.add("low-stock");
    }

    div.innerHTML = `
      <div class="item-name">${item.name}</div>
      <div class="item-count">${count}</div>
      <div class="item-label">Available Units</div>
    `;

    dcpGrid.appendChild(div);
  });
}

// Load on page load
document.addEventListener("DOMContentLoaded", () => {
  loadDCPMonitor();
  restoreFullscreenPreference();
  loadAdminProfile();
});

// Update monitor when returning to home page
window.addEventListener("focus", loadDCPMonitor);

// ========== CARD DETAILS MODAL FUNCTIONS ==========
function showCardDetails(cardType) {
  const modal = document.getElementById("cardModal");
  const modalBody = document.getElementById("modalBody");
  const inventory = JSON.parse(localStorage.getItem("inventoryData")) || [];
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  const history = JSON.parse(localStorage.getItem("history")) || [];

  let content = "";

  switch(cardType) {
    case 'total':
      let totalItems = 0;
      inventory.forEach(item => {
        totalItems += item.codes.length;
      });
      content = `
        <h2>📦 Total Items</h2>
        <p>Total number of items currently in your inventory system.</p>
        <div class="modal-stats">
          <div class="stat-item">
            <strong>${totalItems}</strong>
            <span>Total Items</span>
          </div>
          <div class="stat-item">
            <strong>${inventory.length}</strong>
            <span>Item Types</span>
          </div>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #999;">Last updated: ${new Date().toLocaleString()}</p>
      `;
      break;

    case 'borrowed':
      content = `
        <h2>📤 Borrowed Items</h2>
        <p>Items that are currently borrowed and not in the inventory.</p>
        <div class="modal-stats">
          <div class="stat-item">
            <strong>${transactions.length}</strong>
            <span>Currently Borrowed</span>
          </div>
          <div class="stat-item">
            <strong>${history.length}</strong>
            <span>Total Transactions</span>
          </div>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #999;">Last updated: ${new Date().toLocaleString()}</p>
      `;
      break;

    case 'overdue':
      const overdueCount = transactions.filter(t => {
        if (t.dueDate) {
          return new Date(t.dueDate) < new Date();
        }
        return false;
      }).length;
      content = `
        <h2>⏰ Overdue Items</h2>
        <p>Items that past their return due date.</p>
        <div class="modal-stats">
          <div class="stat-item">
            <strong>${overdueCount}</strong>
            <span>Overdue Items</span>
          </div>
          <div class="stat-item">
            <strong>${transactions.length - overdueCount}</strong>
            <span>On Time</span>
          </div>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #999;">Last updated: ${new Date().toLocaleString()}</p>
      `;
      break;

    case 'transaction':
      content = `
        <h2>📋 Transactions</h2>
        <p>Complete record of all borrow and return transactions.</p>
        <div class="modal-stats">
          <div class="stat-item">
            <strong>${history.length}</strong>
            <span>Total Transactions</span>
          </div>
          <div class="stat-item">
            <strong>${transactions.length}</strong>
            <span>Active Borrows</span>
          </div>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #999;">Last updated: ${new Date().toLocaleString()}</p>
      `;
      break;
  }

  modalBody.innerHTML = content;
  modal.style.display = "flex";
}

function closeCardModal() {
  const modal = document.getElementById("cardModal");
  modal.style.display = "none";
}

// Close modal when clicking outside
document.addEventListener("click", (e) => {
  const modal = document.getElementById("cardModal");
  if (e.target === modal) {
    closeCardModal();
  }
});

// ========== FULLSCREEN TOGGLE FUNCTION ==========
function toggleFullscreen() {
  const body = document.body;
  const btn = document.getElementById("fullscreenToggle");
  
  body.classList.toggle("fullscreen-mode");
  
  if (body.classList.contains("fullscreen-mode")) {
    localStorage.setItem("fullscreenMode", "true");
    btn.textContent = "☰";
    btn.title = "Show Sidebar";
  } else {
    localStorage.setItem("fullscreenMode", "false");
    btn.textContent = "☰";
    btn.title = "Hide Sidebar";
  }
}

function restoreFullscreenPreference() {
  const isFullscreen = localStorage.getItem("fullscreenMode") === "true";
  if (isFullscreen) {
    document.body.classList.add("fullscreen-mode");
    const btn = document.getElementById("fullscreenToggle");
    if (btn) {
      btn.textContent = "☰";
      btn.title = "Show Sidebar";
    }
  } else {
    const btn = document.getElementById("fullscreenToggle");
    if (btn) {
      btn.textContent = "☰";
      btn.title = "Hide Sidebar";
    }
  }
}

// ========================
// ADMIN PROFILE DROPDOWN (moved to end)
// ========================
function toggleProfileDropdown() {
  const dropdown = document.getElementById("profileDropdown");
  const btn = document.querySelector(".admin-profile-btn");
  
  if (dropdown.classList.contains("active")) {
    dropdown.classList.remove("active");
    btn.classList.remove("active");
  } else {
    dropdown.classList.add("active");
    btn.classList.add("active");
  }
}

function editProfileClick() {
  window.location.href = "settings.html";
}

function loadAdminProfile() {
  const username = localStorage.getItem("adminUsername") || "Administrator";
  const email = localStorage.getItem("adminEmail") || "admin@logbook.com";
  
  document.getElementById("profileUsername").textContent = username;
  document.getElementById("profileEmail").textContent = email;
  document.querySelector(".admin-name").textContent = username.split(" ")[0];
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("currentUser");
    window.location.href = "admin-login.html";
  }
}

document.addEventListener("click", function(event) {
  const profileContainer = document.querySelector(".admin-profile-container");
  const dropdown = document.getElementById("profileDropdown");
  if (profileContainer && !profileContainer.contains(event.target)) {
    dropdown.classList.remove("active");
    document.querySelector(".admin-profile-btn").classList.remove("active");
  }
});

