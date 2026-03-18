// ========================
// ADMIN PROFILE DROPDOWN
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

function showEditProfile() {
  editProfileClick();
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

// === ELEMENTS ===
const transactionBody = document.getElementById("transactionBody");
const historyBody = document.getElementById("historyBody");
const searchInput = document.getElementById("searchInput");
const returnModal = document.getElementById("returnModal");
const borrowerInfo = document.getElementById("borrowerInfo");
const markReturnedBtn = document.getElementById("markReturned");
const closeBtn = document.querySelector(".close");
const remarksInput = document.getElementById("remarksInput");
const activeTab = document.getElementById("activeTab");
const historyTab = document.getElementById("historyTab");
const activeContainer = document.getElementById("activeContainer");
const historyContainer = document.getElementById("historyContainer");

let selectedIndex = null;

// === HELPER: Generate item codes ===
function gen(prefix, total) {
  const codes = [];
  for (let i = 1; i <= total; i++) {
    codes.push(`${prefix} ${i.toString().padStart(3, "0")}`);
  }
  return codes;
}

// === NOTIFICATION HELPER ===
function addNotification(message, type = "info") {
  const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
  const now = new Date();
  const time = now.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  notifications.unshift({
    message,
    type,
    time,
  });
  localStorage.setItem("notifications", JSON.stringify(notifications));
}

// === GET CODE FOR ITEM (fallback only) ===
function getItemCode(itemName) {
  const dcpItems = JSON.parse(localStorage.getItem("inventoryData")) || [];
  const found = dcpItems.find(i => i.name === itemName);
  return found && found.codes && found.codes.length ? found.codes[0] : "⚠️ Not assigned";
}

// === LOAD TRANSACTIONS ===
function loadTransactions() {
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  transactionBody.innerHTML = "";

  if (transactions.length === 0) {
    transactionBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; color:gray; font-style:italic; padding:15px;">
          No active transactions.
        </td>
      </tr>`;
    return;
  }

  // 🔔 Check due and late returns
  const today = new Date();
  transactions.forEach(t => {
    if (t.dueDate) {
      const dueDate = new Date(t.dueDate);
      if (today > dueDate) {
        if (!t.status || t.status !== "Overdue") {
          t.status = "Overdue";
          const diffMs = today - dueDate;
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          addNotification(`Overdue: ${t.studentName} has ${t.item} overdue by ${diffDays} day(s).`, "warning");
        }
      } else {
        t.status = "Borrowed";
      }
    } else {
      // Fallback to old logic if no dueDate
      const borrowDate = new Date(t.date);
      const diffDays = (today - borrowDate) / (1000 * 60 * 60 * 24);
      if (diffDays > 7) {
        if (!t.status || t.status !== "Overdue") {
          t.status = "Overdue";
          addNotification(`Overdue: ${t.studentName} has ${t.item} overdue by ${Math.round(diffDays - 7)} day(s).`, "warning");
        }
      } else {
        t.status = "Borrowed";
      }
    }
  });

  // 🔄 Display table
  transactions.forEach((t, index) => {
    const status = t.status || "Borrowed";
    const rowClass = status === "Overdue" ? "overdue-row" : "";
    const tr = document.createElement("tr");
    tr.className = rowClass;
    tr.innerHTML = `
      <td>${t.borrowerId || "-"}</td>
      <td class="clickable" style="color:#004aad;cursor:pointer;text-decoration:underline;">
        ${t.studentName || "Unknown"}
      </td>
      <td>${t.item || "-"}</td>
      <td>${t.quantity || "-"}</td>
      <td>${t.condition || "-"}</td>
      <td>${t.dateBorrowed || t.date || "-"}</td>
      <td>${t.dueDate || "-"}</td>
      <td>${status}</td>
      <td>${t.remarks || "-"}</td>
    `;
    tr.querySelector(".clickable").addEventListener("click", () => openReturnModal(index));
    transactionBody.appendChild(tr);
  });
}

loadTransactions();

// === LOAD HISTORY ===
function loadHistory() {
  const history = JSON.parse(localStorage.getItem("history")) || [];
  historyBody.innerHTML = "";

  if (history.length === 0) {
    historyBody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center; color:gray; font-style:italic; padding:15px;">
          No transaction history yet.
        </td>
      </tr>`;
    return;
  }

  history.forEach((h, index) => {
    // Determine if it was overdue
    let historyStatus = "Returned";
    if (h.dueDate) {
      const dueDate = new Date(h.dueDate);
      const returnDate = new Date(h.returnedAt);
      if (returnDate > dueDate) {
        historyStatus = "Overdue Returned";
      }
    } else {
      const borrowDate = new Date(h.borrowedAt);
      const returnDate = new Date(h.returnedAt);
      const diffDays = (returnDate - borrowDate) / (1000 * 60 * 60 * 24);
      if (diffDays > 7) {
        historyStatus = "Overdue Returned";
      }
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${h.borrowerId || "-"}</td>
      <td>${h.studentName || "Unknown"}</td>
      <td>${h.item || "-"}</td>
      <td>${h.quantity || "-"}</td>
      <td>${h.condition || "-"}</td>
      <td>${h.borrowedAt || "-"}</td>
      <td>${h.dueDate || "-"}</td>
      <td>${h.returnedAt || "-"}</td>
      <td>${historyStatus}</td>
      <td><button class="delete-btn" data-index="${index}" title="Delete this record"><i class="fa-solid fa-trash"></i></button></td>
    `;
    historyBody.appendChild(tr);
  });
}

loadHistory();

// === TAB SWITCHING ===
activeTab.addEventListener("click", () => {
  activeTab.classList.add("active");
  historyTab.classList.remove("active");
  activeContainer.style.display = "block";
  historyContainer.style.display = "none";
});

historyTab.addEventListener("click", () => {
  historyTab.classList.add("active");
  activeTab.classList.remove("active");
  activeContainer.style.display = "none";
  historyContainer.style.display = "block";
});

// === SEARCH FUNCTION ===
searchInput.addEventListener("keyup", () => {
  const filter = searchInput.value.toLowerCase();
  const isActive = activeContainer.style.display !== "none";
  const tbody = isActive ? transactionBody : historyBody;

  const rows = tbody.querySelectorAll("tr");
  rows.forEach(row => {
    if (row.id === "emptyRow" || row.id === "emptyHistoryRow") return;
    const name = row.children[1]?.textContent.toLowerCase() || "";
    const id = row.children[0]?.textContent.toLowerCase() || "";
    row.style.display = name.includes(filter) || id.includes(filter) ? "" : "none";
  });
});

// clickable search icon triggers the same filter
const searchBtn = document.getElementById('searchBtn');
if (searchBtn) {
  searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    searchInput.focus();
    // trigger the same filtering logic
    searchInput.dispatchEvent(new Event('keyup'));
  });
}

// === OPEN RETURN MODAL ===
function openReturnModal(index) {
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  const t = transactions[index];
  selectedIndex = index;

  if (!t) return alert("⚠️ Transaction data missing!");

  const codesText = t.itemCodes && t.itemCodes.length
    ? t.itemCodes.join(", ")
    : "⚠️ Not assigned";

  borrowerInfo.innerHTML = `
    <p><strong>Borrower ID:</strong> ${t.borrowerId}</p>
    <p><strong>Name:</strong> ${t.studentName}</p>
    <p><strong>Item:</strong> ${t.item}</p>
    <p><strong>Item Code:</strong> ${codesText}</p>
    <p><strong>Quantity:</strong> ${t.quantity || 1}</p>
    <p><strong>Condition:</strong> ${t.condition}</p>
    <p><strong>Date Borrowed:</strong> ${t.date}</p>
    <p><strong>Date Returned:</strong> ${t.returnDate || "Not yet returned"}</p>
  `;

  remarksInput.value = "";
  returnModal.style.display = "flex";
}

// === MARK AS RETURNED ===
markReturnedBtn.addEventListener("click", () => {
  if (selectedIndex === null) return alert("⚠️ No transaction selected.");

  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  const inventory = JSON.parse(localStorage.getItem("inventoryData")) || [];
  const history = JSON.parse(localStorage.getItem("history")) || [];

  const transaction = transactions[selectedIndex];
  if (!transaction) return alert("⚠️ Transaction not found.");

  const remarks = remarksInput.value.trim() || "-";

  // ✅ Format date
  const now = new Date();
  const formattedDate = now.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // ✅ Update transaction details
  transaction.status = "Returned";
  transaction.returnDate = formattedDate;
  transaction.remarks = remarks;

  // ✅ Return item codes to inventory
  const dcpItems = inventory.map(item => {
    if (item.name === transaction.item) {
      if (!item.codes) item.codes = [];
      if (transaction.itemCodes && transaction.itemCodes.length) {
        item.codes.push(...transaction.itemCodes);
      }
      item.available = (item.available || 0) + (transaction.quantity || 1);
    }
    return item;
  });

  // ✅ Add to history
  history.push({
    borrowerId: transaction.borrowerId,
    studentName: transaction.studentName,
    item: transaction.item,
    itemCodes: transaction.itemCodes || [],
    quantity: transaction.quantity,
    condition: transaction.condition,
    borrowedAt: transaction.dateBorrowed || transaction.date,
    dueDate: transaction.dueDate,
    returnedAt: formattedDate,
    remarks: remarks,
    status: "Returned"
  });

  // ✅ Remove from active transaction list
  transactions.splice(selectedIndex, 1);

  // ✅ Save all changes
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("inventoryData", JSON.stringify(dcpItems));
  localStorage.setItem("history", JSON.stringify(history));

  // 🔔 Notification
  addNotification(`Item "${transaction.item}" returned by ${transaction.studentName}.`, "success");

  alert("✅ Item successfully marked as returned!");
  closeReturnModal();
  
  // Reload the current active tab
  if (activeContainer.style.display === "block") {
    loadTransactions();
  } else {
    loadHistory();
  }
});

// === CLOSE MODAL ===
closeBtn.addEventListener("click", closeReturnModal);
window.addEventListener("click", (e) => {
  if (e.target === returnModal) closeReturnModal();
});

function closeReturnModal() {
  returnModal.style.display = "none";
  selectedIndex = null;
}

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

// ========== LOGOUT FUNCTION ==========
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("loggedIn");
    window.location.href = "admin-login.html";
  }
}

// === SAVE TRANSACTION ===
function confirmBorrow() {
  if (orderList.length === 0) return alert("⚠️ No items added yet!");

  // ⏰ CHECK IF BORROWING IS ALLOWED (8am - 4pm)
  const now = new Date();
  const hour = now.getHours();
  if (hour < 8 || hour >= 16) {
    return alert("⏰ Borrowing is only available between 8:00 AM and 4:00 PM. Please try again during business hours.");
  }

  const borrowerId = orderList[0].id;
  const studentName = orderList[0].name;
  const condition = orderList[0].condition || "Good Condition";
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Calculate due date: Next weekday (Monday to Friday) at 5:00 PM
  const dueDate = getNextWeekday(now);
  dueDate.setHours(17, 0, 0, 0); // 5:00 PM
  const dueDateStr = dueDate.toLocaleDateString();
  const dueTimeStr = dueDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const transaction = {
    borrowerId,
    studentName,
    item: orderList.map(o => o.item).join(", "),
    itemCodes: orderList.flatMap(o => o.codes),
    quantity: orderList.reduce((sum, o) => sum + o.qty, 0),
    condition,
    dateBorrowed: `${dateStr}, ${timeStr}`,
    dueDate: `${dueDateStr}, ${dueTimeStr}`,
    returnDate: "",
    status: "Borrowed",
    remarks: "-",
  };

  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  if (typeof addNotification === "function") {
    addNotification(`New borrow: ${studentName} borrowed ${transaction.item}`, "borrow");
  }

  alert("✅ Borrow transaction recorded successfully!");
  window.location.href = "transaction.html";
}

// === HELPER FUNCTION: Get Next Weekday (Monday to Friday) ===
function getNextWeekday(date) {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  let daysToAdd = 0;

  if (dayOfWeek === 0) { // Sunday -> Monday
    daysToAdd = 1;
  } else if (dayOfWeek === 6) { // Saturday -> Monday
    daysToAdd = 2;
  } else { // Monday to Friday -> Next day
    daysToAdd = 1;
  }

  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + daysToAdd);
  return nextDate;
}

// === PRINT TABLE FUNCTION ===
function printTable() {
  const historyTab = document.getElementById("historyTab");
  const activeTab = document.getElementById("activeTab");
  const historyContainer = document.getElementById("historyContainer");
  const activeContainer = document.getElementById("activeContainer");
  
  // Check which table is active
  const isHistoryActive = historyTab.classList.contains("active");
  const tableId = isHistoryActive ? "historyTable" : "transactionTable";
  const table = document.getElementById(tableId);
  
  if (!table) return alert("No table to print!");
  
  // Open a new window
  const printWindow = window.open('', '', 'width=900,height=700');
  const tableTitle = isHistoryActive ? "Transaction History" : "Active Transactions";
  
  printWindow.document.write(`
    <html>
      <head>
        <title>${tableTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h2 { text-align: center; color: #333; }
          p { text-align: center; color: #666; font-size: 12px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #333; padding: 12px; text-align: left; }
          th { background: #f5f5f5; font-weight: bold; }
          tr:nth-child(even) { background: #f9f9f9; }
        </style>
      </head>
      <body>
        <h2>${tableTitle}</h2>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        ${table.outerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}

// === EXPORT TO EXCEL FUNCTION ===
function exportToExcel() {
  const historyTab = document.getElementById("historyTab");
  const isHistoryActive = historyTab.classList.contains("active");
  const tableId = isHistoryActive ? "historyTable" : "transactionTable";
  const table = document.getElementById(tableId);
  
  if (!table) return alert("No table to export!");
  
  // Get table headers
  const headers = [];
  table.querySelectorAll("th").forEach(th => {
    headers.push(th.textContent.trim());
  });
  
  // Get table data
  const rows = [];
  table.querySelectorAll("tbody tr").forEach(tr => {
    const cells = [];
    tr.querySelectorAll("td").forEach(td => {
      cells.push(td.textContent.trim());
    });
    if (cells.length > 0 && cells[0] !== "No borrowed items yet." && cells[0] !== "No transaction history yet.") {
      rows.push(cells);
    }
  });
  
  // Create CSV content
  let csv = headers.join(",") + "\n";
  rows.forEach(row => {
    csv += row.map(cell => `"${cell}"`).join(",") + "\n";
  });
  
  // Create and download file
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  const fileName = `${isHistoryActive ? "Transaction_History" : "Active_Transactions"}_${new Date().toISOString().split('T')[0]}.csv`;
  
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// === DELETE SINGLE RECORD FUNCTION (ARCHIVE) ===
function deleteSingleRecord(index) {
  if (confirm("Archive this record? You can view it in Settings > Archive.")) {
    const history = JSON.parse(localStorage.getItem("history")) || [];
    const archive = JSON.parse(localStorage.getItem("archive")) || [];
    
    // Move record to archive
    const archivedRecord = history[index];
    archivedRecord.archivedAt = new Date().toLocaleString();
    archive.push(archivedRecord);
    
    // Remove from history
    history.splice(index, 1);
    
    // Update localStorage
    localStorage.setItem("history", JSON.stringify(history));
    localStorage.setItem("archive", JSON.stringify(archive));
    
    loadHistory();
  }
}

// === DELETE ALL RECORDS FUNCTION (ARCHIVE ALL) ===
function deleteAllHistory() {
  if (confirm("Archive all transaction records? You can view them in Settings > Archive.")) {
    if (confirm("This will move all records to archive. Are you absolutely sure?")) {
      const history = JSON.parse(localStorage.getItem("history")) || [];
      const archive = JSON.parse(localStorage.getItem("archive")) || [];
      
      // Move all records to archive with timestamp
      history.forEach(record => {
        record.archivedAt = new Date().toLocaleString();
        archive.push(record);
      });
      
      // Clear history
      localStorage.setItem("history", JSON.stringify([]));
      localStorage.setItem("archive", JSON.stringify(archive));
      
      loadHistory();
    }
  }
}

// === DATE FILTER FUNCTION ===
function filterByDateRange() {
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;
  const historyBody = document.getElementById("historyBody");
  const rows = historyBody.querySelectorAll("tr");
  
  if (!fromDate || !toDate) {
    alert("Please select both From and To dates!");
    return;
  }
  
  const from = new Date(fromDate);
  const to = new Date(toDate);
  
  if (from > to) {
    alert("From date must be earlier than To date!");
    return;
  }
  
  let visibleCount = 0;
  
  rows.forEach(row => {
    const dateBorrowedCell = row.cells[5]; // Date Borrowed column
    if (!dateBorrowedCell) return;
    
    const dateText = dateBorrowedCell.textContent.trim();
    if (dateText === "No transaction history yet.") {
      row.style.display = "none";
      return;
    }
    
    // Parse date from various formats
    const rowDate = new Date(dateText);
    
    // Check if date is within range (inclusive)
    if (rowDate >= from && rowDate <= to) {
      row.style.display = "";
      visibleCount++;
    } else {
      row.style.display = "none";
    }
  });
  
  // Show empty message if no results
  if (visibleCount === 0) {
    const emptyRow = document.getElementById("emptyHistoryRow");
    if (emptyRow) {
      emptyRow.textContent = "No transactions found in the selected date range.";
      emptyRow.parentElement.querySelector("tr").style.display = "";
    }
  }
}

// === CLEAR DATE FILTER FUNCTION ===
function clearDateFilter() {
  document.getElementById("fromDate").value = "";
  document.getElementById("toDate").value = "";
  const historyBody = document.getElementById("historyBody");
  const rows = historyBody.querySelectorAll("tr");
  
  rows.forEach(row => {
    row.style.display = "";
  });
  
  // Reset empty message
  const emptyRow = document.getElementById("emptyHistoryRow");
  if (emptyRow) {
    emptyRow.innerHTML = '<td colspan="10" style="text-align:center; color:gray; font-style:italic; padding:20px;">No transaction history yet.</td>';
  }
}

// === ADD EVENT LISTENERS FOR PRINT AND EXPORT BUTTONS ===
document.addEventListener("DOMContentLoaded", function() {
  loadAdminProfile();
  const printBtn = document.getElementById("printBtn");
  const excelBtn = document.getElementById("excelBtn");
  const historyTab = document.getElementById("historyTab");
  const activeTab = document.getElementById("activeTab");
  const exportControls = document.getElementById("exportControls");
  const dateFilter = document.getElementById("dateFilter");
  const filterBtn = document.getElementById("filterBtn");
  const clearFilterBtn = document.getElementById("clearFilterBtn");
  const deleteAllBtn = document.getElementById("deleteAllBtn");
  
  // Show export buttons and date filter only when in history tab
  if (historyTab && activeTab && exportControls && dateFilter) {
    historyTab.addEventListener("click", () => {
      exportControls.style.display = "flex";
      dateFilter.style.display = "flex";
    });
    
    activeTab.addEventListener("click", () => {
      exportControls.style.display = "none";
      dateFilter.style.display = "none";
    });
  }
  
  // Add event listeners for print and export buttons
  if (printBtn) {
    printBtn.addEventListener("click", printTable);
  }
  
  if (excelBtn) {
    excelBtn.addEventListener("click", exportToExcel);
  }
  
  // Add event listeners for date filter buttons
  if (filterBtn) {
    filterBtn.addEventListener("click", filterByDateRange);
  }
  
  if (clearFilterBtn) {
    clearFilterBtn.addEventListener("click", clearDateFilter);
  }
  
  // Add event listener for delete all button
  if (deleteAllBtn) {
    deleteAllBtn.addEventListener("click", deleteAllHistory);
  }
  
  // Add event listeners for individual delete buttons
  document.addEventListener("click", function(event) {
    if (event.target.closest(".delete-btn")) {
      const deleteBtn = event.target.closest(".delete-btn");
      const index = deleteBtn.getAttribute("data-index");
      deleteSingleRecord(index);
    }
  });
});