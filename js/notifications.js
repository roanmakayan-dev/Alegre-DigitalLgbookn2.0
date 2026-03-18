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
  const currentUser = localStorage.getItem("currentUser");
  let username = "Administrator";
  let email = "admin@logbook.com";
  
  if (currentUser) {
    try {
      const user = JSON.parse(currentUser);
      username = user.username || "Administrator";
      email = user.email || "admin@logbook.com";
    } catch (e) {
      console.warn("Error parsing currentUser:", e);
    }
  }
  
  document.getElementById("profileUsername").textContent = username;
  document.getElementById("profileEmail").textContent = email;
  const adminName = document.querySelector(".admin-name");
  if (adminName) adminName.textContent = username.split(" ")[0];
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("dcpUserType");
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

// ==========================
// ELEMENTS
// ==========================
const unreadBody = document.getElementById("unreadBody");
const readBody = document.getElementById("readBody");
const unreadSection = document.getElementById("unreadSection");
const readSection = document.getElementById("readSection");
const emptyUnread = document.getElementById("emptyUnread");
const emptyRead = document.getElementById("emptyRead");
const markAllReadBtn = document.getElementById("markAllReadBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const confirmModal = document.getElementById("confirmModal");
const confirmText = document.getElementById("confirmText");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

// ==========================
// TAB SWITCHING
// ==========================
function switchNotificationTab(tabName) {
  const unreadSection = document.getElementById("unreadSection");
  const readSection = document.getElementById("readSection");
  const tabs = document.querySelectorAll(".section-tab");
  
  tabs.forEach(tab => tab.classList.remove("active"));
  
  if (tabName === "unread") {
    unreadSection.classList.add("active-section");
    readSection.classList.remove("active-section");
    tabs[0].classList.add("active");
  } else {
    readSection.classList.add("active-section");
    unreadSection.classList.remove("active-section");
    tabs[1].classList.add("active");
  }
}

// ==========================
// NOTIFICATION SOUND SYSTEM
// ==========================
const notificationSound = new Audio("assets/notify.mp3");
function playNotificationSound() {
  notificationSound.currentTime = 0;
  notificationSound.play().catch(() => {});
}

// ==========================
// TIME FORMAT (WITH DATE)
// ==========================
function getFormattedTime() {
  const now = new Date();
  const date = now.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${date} at ${time}`;
}

// ==========================
// LOAD AND DISPLAY NOTIFICATIONS
// ==========================
function loadNotifications() {
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
  
  // Auto-mark all as read on page load
  const hasUnread = notifications.some(notif => !notif.read);
  if (hasUnread) {
    notifications.forEach(notif => {
      notif.read = true;
    });
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }
  
  // Separate unread and read notifications
  const unreadNotifications = notifications.filter(notif => !notif.read);
  const readNotifications = notifications.filter(notif => notif.read);
  
  // Determine overall visibility
  const hasContent = notifications.length > 0;
  markAllReadBtn.style.display = hasContent ? "inline-block" : "none";
  clearAllBtn.style.display = hasContent ? "inline-block" : "none";
  
  // UNREAD SECTION
  if (unreadNotifications.length === 0) {
    emptyUnread.style.display = "block";
    unreadBody.innerHTML = "";
  } else {
    emptyUnread.style.display = "none";
    unreadBody.innerHTML = unreadNotifications
      .map((notif, index) => {
        const originalIndex = notifications.indexOf(notif);
        const typeIcon = notif.type === 'equipment' ? '📦' : notif.type === 'borrow' ? '📋' : '📢';
        return `
          <tr>
            <td>${typeIcon} ${notif.type || 'Alert'}</td>
            <td>${escapeHtml(notif.message)}</td>
            <td>${notif.time}</td>
            <td>
              <button class="btn-delete" onclick="deleteNotification(${originalIndex})" title="Delete">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>
        `;
      })
      .join("");
  }
  
  // READ SECTION
  if (readNotifications.length === 0) {
    emptyRead.style.display = "block";
    readBody.innerHTML = "";
  } else {
    emptyRead.style.display = "none";
    readBody.innerHTML = readNotifications
      .map((notif, index) => {
        const originalIndex = notifications.indexOf(notif);
        const typeIcon = notif.type === 'equipment' ? '📦' : notif.type === 'borrow' ? '📋' : '📢';
        return `
          <tr>
            <td>${typeIcon} ${notif.type || 'Alert'}</td>
            <td>${escapeHtml(notif.message)}</td>
            <td>${notif.time}</td>
            <td>
              <button class="btn-delete" onclick="deleteNotification(${originalIndex})" title="Delete">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>
        `;
      })
      .join("");
  }
}


// ==========================
// ESCAPE HTML (SECURITY)
// ==========================
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ==========================
// DELETE NOTIFICATION
// ==========================
function deleteNotification(index) {
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
  const deletedNotif = notifications[index];
  
  showConfirm(
    `Delete this notification?\n\n"${deletedNotif.message.substring(0, 50)}..."`,
    (confirmed) => {
      if (confirmed) {
        notifications.splice(index, 1);
        localStorage.setItem("notifications", JSON.stringify(notifications));
        loadNotifications();
        showSuccessNotice("Notification deleted successfully!");
      }
    }
  );
}

// ==========================
// TOGGLE READ STATUS
// ==========================
function toggleReadStatus(index) {
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
  if (notifications[index]) {
    notifications[index].read = !notifications[index].read;
    localStorage.setItem("notifications", JSON.stringify(notifications));
    loadNotifications();
  }
}

// ==========================
// MARK ALL AS READ
// ==========================
function markAllAsRead() {
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
  if (notifications.length === 0) return alert("No notifications to mark as read.");

  showConfirm("Mark all notifications as read?", (confirmed) => {
    if (confirmed) {
      notifications.forEach(notif => {
        notif.read = true;
      });
      localStorage.setItem("notifications", JSON.stringify(notifications));
      loadNotifications();
      showSuccessNotice("All notifications marked as read!");
    }
  });
}

// ==========================
// CLEAR ALL NOTIFICATIONS
// ==========================
function clearAllNotifications() {
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
  if (notifications.length === 0) return alert("No notifications to clear.");

  showConfirm("⚠️ Clear ALL notifications? This cannot be undone!", (confirmed) => {
    if (confirmed) {
      localStorage.removeItem("notifications");
      loadNotifications();
      showSuccessNotice("All notifications cleared!");
    }
  });
}

// ==========================
// SHOW CONFIRMATION MODAL
// ==========================
function showConfirm(message, callback) {
  confirmText.textContent = message;
  confirmModal.style.display = "flex";
  
  const handleYes = () => {
    confirmModal.style.display = "none";
    callback(true);
    confirmYes.removeEventListener("click", handleYes);
    confirmNo.removeEventListener("click", handleNo);
  };
  
  const handleNo = () => {
    confirmModal.style.display = "none";
    callback(false);
    confirmYes.removeEventListener("click", handleYes);
    confirmNo.removeEventListener("click", handleNo);
  };
  
  confirmYes.addEventListener("click", handleYes);
  confirmNo.addEventListener("click", handleNo);
}

// ==========================
// SHOW SUCCESS NOTICE
// ==========================
function showSuccessNotice(message) {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 99999;
  `;
  const box = document.createElement("div");
  box.style.cssText = `
    background: linear-gradient(145deg, rgba(20, 30, 40, 0.95), rgba(10, 15, 20, 0.98));
    padding: 24px 36px; border-radius: 16px;
    text-align: center; max-width: 380px;
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.2);
    color: #00ffff;
    border: 1px solid rgba(0, 255, 255, 0.2);
    animation: popIn 0.3s ease;
  `;
  box.innerHTML = `<h3 style="margin-bottom:10px;">✅ Success</h3><p>${message}</p>`;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  playNotificationSound();
  setTimeout(() => overlay.remove(), 3000);
}

// ==========================
// LOGOUT FUNCTION
// ==========================
function logout() {
  showConfirm("Are you sure you want to logout?", (confirmed) => {
    if (confirmed) {
      localStorage.removeItem("loggedIn");
      window.location.href = "admin-login.html";
    }
  });
}

// ==========================
// INITIALIZATION
// ==========================
window.addEventListener("load", () => {
  // Check for login and create notification
  const hasNotifiedLogin = localStorage.getItem("loginNotified");
  if (!hasNotifiedLogin) {
    addNotification("👤 Welcome! You have successfully logged in.", "login");
    localStorage.setItem("loginNotified", "true");
  }

  // Check for new borrowed items
  checkNewBorrowedItems();

  // Check for pending returns
  checkPendingReturns();

  loadNotifications();

  // Add pop-in animation to modal
  const style = document.createElement("style");
  style.textContent = `
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
  `;
  document.head.appendChild(style);

  // Restore fullscreen preference
  const isFullscreen = localStorage.getItem("fullscreenMode") === "true";
  if (isFullscreen) {
    document.body.classList.add("fullscreen-mode");
  }
});

// ==========================
// CHECK FOR NEW BORROWED ITEMS
// ==========================
function checkNewBorrowedItems() {
  const borrowData = JSON.parse(localStorage.getItem("borrowSummary") || "[]");
  const notifiedBorrows = JSON.parse(localStorage.getItem("notifiedBorrows") || "[]");

  borrowData.forEach((borrow) => {
    const borrowKey = `${borrow.borrowerId}-${borrow.studentName}-${borrow.item}`;
    
    if (!notifiedBorrows.includes(borrowKey)) {
      addNotification(
        `📦 New Item Borrowed: ${borrow.studentName} borrowed ${borrow.item} (Qty: ${borrow.qty})`,
        "borrow"
      );
      notifiedBorrows.push(borrowKey);
    }
  });

  localStorage.setItem("notifiedBorrows", JSON.stringify(notifiedBorrows));
}

// ==========================
// CHECK FOR PENDING RETURNS
// ==========================
function checkPendingReturns() {
  const borrowData = JSON.parse(localStorage.getItem("borrowSummary") || "[]");
  const notifiedReturns = JSON.parse(localStorage.getItem("notifiedReturns") || "[]");

  borrowData.forEach((borrow, index) => {
    const returnKey = `return-${index}`;
    
    // Check if item has been returned (you can add a returnDate field)
    if (!borrow.returnDate && !notifiedReturns.includes(returnKey)) {
      addNotification(
        `⏰ Pending Return: ${borrow.studentName} has not yet returned ${borrow.item}`,
        "pending"
      );
      notifiedReturns.push(returnKey);
    }
  });

  localStorage.setItem("notifiedReturns", JSON.stringify(notifiedReturns));
}

// ==========================
// ADD NOTIFICATION FUNCTION
// ==========================
function addNotification(message, type = "info") {
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
  
  const notification = {
    message,
    type,
    time: getFormattedTime(),
    read: false,
    timestamp: Date.now()
  };

  notifications.unshift(notification); // Add to beginning
  localStorage.setItem("notifications", JSON.stringify(notifications));
  
  // Play notification sound
  playNotificationSound();
}

// ==========================
// AUTO-REFRESH NOTIFICATIONS
// ==========================
setInterval(() => {
  loadNotifications();
}, 5000); // Refresh every 5 seconds

// ==========================
// FULLSCREEN TOGGLE FUNCTION
// ==========================
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

// ==========================
// AUTOMATIC NOTIFICATION SYSTEM (8am-4pm)
// ==========================
function isBusinessHours() {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 8 && hour < 16; // 8am to 4pm
}

function checkOverdueItems() {
  if (!isBusinessHours()) return;
  
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
  const checkedOverdue = JSON.parse(localStorage.getItem('checkedOverdueItems') || '[]');
  
  transactions.forEach((transaction, index) => {
    // Check if item is overdue and not returned
    if (transaction.status !== 'Returned' && transaction.dueDate) {
      const today = new Date();
      const dueDate = new Date(transaction.dueDate);
      
      if (today > dueDate) {
        // Create unique identifier for this overdue transaction
        const uniqueId = `${transaction.borrowerId}_${transaction.item}_${transaction.date}`;
        
        // Check if we've already notified about this overdue
        if (!checkedOverdue.includes(uniqueId)) {
          const daysDifference = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
          const notif = {
            type: 'overdue',
            message: `⚠️ OVERDUE: ${transaction.studentName} (${transaction.borrowerId}) has not returned "${transaction.item}" (Due: ${transaction.dueDate}, ${daysDifference} day(s) late)`,
            time: getFormattedTime(),
            read: false
          };
          notifications.unshift(notif);
          checkedOverdue.push(uniqueId);
          playNotificationSound();
        }
      }
    }
  });
  
  localStorage.setItem('notifications', JSON.stringify(notifications));
  localStorage.setItem('checkedOverdueItems', JSON.stringify(checkedOverdue));
  loadNotifications();
}

function checkNewReservations() {
  if (!isBusinessHours()) return;
  
  const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
  const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
  const notifiedReservations = JSON.parse(localStorage.getItem('notifiedReservations') || '[]');
  
  reservations.forEach(reservation => {
    // Check if reservation hasn't been notified yet
    if (!notifiedReservations.includes(reservation.id || reservation.timestamp)) {
      const notif = {
        type: 'reservation',
        message: `📦 NEW RESERVATION: ${reservation.studentName} reserved "${reservation.itemName}" (Expected: ${reservation.expectedDate})`,
        time: getFormattedTime(),
        date: new Date().toISOString().split('T')[0],
        read: false
      };
      notifications.push(notif);
      notifiedReservations.push(reservation.id || reservation.timestamp);
      playNotificationSound();
    }
  });
  
  localStorage.setItem('notifications', JSON.stringify(notifications));
  localStorage.setItem('notifiedReservations', JSON.stringify(notifiedReservations));
  loadNotifications();
}

// Run checks periodically during business hours
setInterval(() => {
  if (isBusinessHours()) {
    checkOverdueItems();
    checkNewReservations();
  }
}, 60000); // Check every minute (60000ms)

// Initial check on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadAdminProfile();
    if (isBusinessHours()) {
      checkOverdueItems();
      checkNewReservations();
    }
  });
} else {
  if (isBusinessHours()) {
    checkOverdueItems();
    checkNewReservations();
  }
}


