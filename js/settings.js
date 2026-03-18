// ==========================
// ELEMENTS
// ==========================
const notifBtn = document.getElementById("notifBtn");
const notifDropdown = document.getElementById("notifDropdown");
const notifList = document.getElementById("notifList");
const loadingModal = document.getElementById("loadingModal");
const loadingText = document.getElementById("loadingText");
const confirmModal = document.getElementById("confirmModal");
const confirmText = document.getElementById("confirmText");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

// ==========================
// BLACKOUT EFFECT OVERLAY
// ==========================
let blackout = document.createElement("div");
blackout.id = "blackoutEffect";
blackout.style.cssText = `
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0);
  opacity: 0;
  pointer-events: none;
  transition: background 1s ease, opacity 1s ease;
  z-index: 9999;
`;
document.body.appendChild(blackout);

// ==========================
// NOTIFICATION SOUND SYSTEM
// ==========================
const notificationSound = new Audio("assets/notify.mp3");
function playNotificationSound() {
  notificationSound.currentTime = 0;
  notificationSound.play().catch(() => {});
}

// ==========================
// TIME FORMAT (NO SECONDS)
// ==========================
function getFormattedTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ==========================
// SHOW NOTICE POPUP
// ==========================
function showNotice(title, message) {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 99999;
  `;
  const box = document.createElement("div");
  box.style.cssText = `
    background: #fff; padding: 24px 36px; border-radius: 16px;
    text-align: center; max-width: 380px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    animation: popIn 0.3s ease;
  `;
  box.innerHTML = `<h3 style="margin-bottom:10px;">${title}</h3><p>${message}</p>`;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  playNotificationSound();
  setTimeout(() => overlay.remove(), 5000);
}

// ==========================
// TAB SWITCHING
// ==========================
function showTab(tabId) {
  document.querySelectorAll(".settings-menu li").forEach(li => li.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
  document.querySelector(`.settings-menu li[onclick*="${tabId}"]`).classList.add("active");
  document.getElementById(tabId).classList.add("active");
}

// ==========================
// DEVELOPER INFORMATION MODAL
// ==========================
function showDeveloperInfo(name, role, image, bio) {
  const modal = document.getElementById("developerModal");
  document.getElementById("devName").textContent = name;
  document.getElementById("devRole").textContent = role;
  document.getElementById("devImage").src = image;
  document.getElementById("devBio").textContent = bio;
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeDeveloperModal() {
  const modal = document.getElementById("developerModal");
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

// Close modal when clicking outside
document.addEventListener("click", function(event) {
  const modal = document.getElementById("developerModal");
  if (event.target === modal) {
    closeDeveloperModal();
  }
});

// ==========================
// ADMIN PROFILE DROPDOWN
// ==========================
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

function openProfileSettings() {
  toggleProfileDropdown();
  showTab("account");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Load and display admin profile info
function loadAdminProfile() {
  const username = localStorage.getItem("adminUsername") || "Administrator";
  const email = localStorage.getItem("adminEmail") || "admin@logbook.com";
  
  document.getElementById("profileUsername").textContent = username;
  document.getElementById("profileEmail").textContent = email;
  document.querySelector(".admin-name").textContent = username.split(" ")[0];
}

function showEditProfile() {
  editProfileClick();
}

// Edit profile functions
function editProfileClick() {
  const username = localStorage.getItem("adminUsername") || "Administrator";
  const email = localStorage.getItem("adminEmail") || "admin@logbook.com";
  
  document.getElementById("editUsername").value = username;
  document.getElementById("editEmail").value = email;
  
  const modal = document.getElementById("editProfileModal");
  modal.style.display = "flex";
  toggleProfileDropdown(); // Close the dropdown
}

function closeEditProfileModal() {
  const modal = document.getElementById("editProfileModal");
  modal.style.display = "none";
}

function saveProfileChanges() {
  const newUsername = document.getElementById("editUsername").value.trim();
  const newEmail = document.getElementById("editEmail").value.trim();
  
  if (!newUsername || !newEmail) {
    alert("⚠️ Please fill in all fields.");
    return;
  }
  
  if (!newEmail.includes("@")) {
    alert("⚠️ Please enter a valid email address.");
    return;
  }
  
  localStorage.setItem("adminUsername", newUsername);
  localStorage.setItem("adminEmail", newEmail);
  
  // Update the profile display
  document.getElementById("profileUsername").textContent = newUsername;
  document.getElementById("profileEmail").textContent = newEmail;
  
  // Update account tab as well
  document.getElementById("username").value = newUsername;
  document.getElementById("email").value = newEmail;
  
  closeEditProfileModal();
  alert("✅ Profile updated successfully!");
}

// Close modal when clicking outside
window.addEventListener("click", function(event) {
  const editModal = document.getElementById("editProfileModal");
  if (editModal && event.target === editModal) {
    closeEditProfileModal();
  }
});

// Close dropdown when clicking outside
document.addEventListener("click", function(event) {
  const profileContainer = document.querySelector(".admin-profile-container");
  const dropdown = document.getElementById("profileDropdown");
  
  if (profileContainer && !profileContainer.contains(event.target)) {
    dropdown.classList.remove("active");
    document.querySelector(".admin-profile-btn").classList.remove("active");
  }
});

// Initialize profile on page load
document.addEventListener("DOMContentLoaded", function() {
  loadAdminProfile();
  loadAccountFormValues();
  loadArchive();
});

// Load account form values from localStorage
function loadAccountFormValues() {
  const username = localStorage.getItem("adminUsername") || "Administrator";
  const email = localStorage.getItem("adminEmail") || "admin@logbook.com";
  
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  
  if (usernameInput) usernameInput.value = username;
  if (emailInput) emailInput.value = email;
}

// ==========================
// ACCOUNT MANAGEMENT
// ==========================
function saveAccount() {
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  if (!username || !email) return alert("⚠️ Please fill in all fields.");

  localStorage.setItem("adminUsername", username);
  localStorage.setItem("adminEmail", email);
  addNotification("👤 Account info updated successfully!");
  alert("✅ Account information saved!");
}

// ==========================
// CHANGE PASSWORD
// ==========================
function changePassword() {
  const currentPass = document.getElementById("currentPass").value;
  const newPass = document.getElementById("newPass").value;
  const confirmPass = document.getElementById("confirmPass").value;
  const storedPass = localStorage.getItem("adminPass") || "12345";

  if (currentPass !== storedPass) return alert("❌ Incorrect current password!");
  if (newPass !== confirmPass) return alert("⚠️ Passwords do not match!");
  if (newPass.length < 4) return alert("⚠️ Password must be at least 4 characters long!");

  localStorage.setItem("adminPass", newPass);
  addNotification("🔒 Password changed successfully!");
  alert("✅ Password updated successfully!");
}

// ==========================
// SECURITY KEY MANAGEMENT (ENHANCED)
// ==========================
function setSecurityKey() {
  const currentKey = localStorage.getItem("securityKey") || "12345";
  const oldKey = prompt("🔑 Enter your OLD Security Key:");
  if (!oldKey) return;
  if (oldKey !== currentKey) return alert("❌ Incorrect old Security Key!");

  const newKey = prompt("🆕 Enter your NEW Security Key:");
  if (!newKey) return alert("⚠️ Security Key not changed.");

  localStorage.setItem("securityKey", newKey);
  addNotification("🔑 Security Key updated successfully!");
  showNotice("Security Key Updated", "Your new security key has been saved successfully!");
}

// ==========================
// CONFIRM MODAL
// ==========================
function showConfirm(message, callback) {
  confirmText.textContent = message;
  confirmModal.style.display = "flex";
  confirmYes.onclick = () => { confirmModal.style.display = "none"; callback(true); };
  confirmNo.onclick = () => { confirmModal.style.display = "none"; callback(false); };
}

// ==========================
// GENERATE ITEM CODES
// ==========================
function gen(prefix, total) {
  const codes = [];
  for (let i = 1; i <= total; i++) {
    codes.push(`${prefix} ${i.toString().padStart(3, "0")}`);
  }
  return codes;
}

// ==========================
// ASK SECURITY KEY (MODAL)
// ==========================
function askSecurityKey(title, callback) {
  const modal = document.createElement("div");
  modal.classList.add("security-modal");
  modal.style.cssText = `
    position: fixed; top:0; left:0; width:100%; height:100%;
    background: rgba(0,0,0,0.7); display:flex;
    justify-content:center; align-items:center; z-index:99999;
  `;

  modal.innerHTML = `
    <div style="background:#fff; padding:25px 40px; border-radius:16px; text-align:center;">
      <h3>${title}</h3>
      <input type="password" id="securityInput" placeholder="Enter Security Key"
             style="padding:8px 12px; border:1px solid #ccc; border-radius:8px; width:100%; margin:12px 0;">
      <div style="display:flex; justify-content:center; gap:10px;">
        <button id="secCancel" style="background:#aaa; color:white; border:none; padding:6px 16px; border-radius:8px;">Cancel</button>
        <button id="secOk" style="background:#007bff; color:white; border:none; padding:6px 16px; border-radius:8px;">Confirm</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelector("#securityInput").focus();

  modal.querySelector("#secCancel").onclick = () => { modal.remove(); callback(null); };
  modal.querySelector("#secOk").onclick = () => {
    const val = modal.querySelector("#securityInput").value.trim();
    modal.remove();
    callback(val || null);
  };
}

// ==========================
// RESTORE ITEMS
// ==========================
function restoreItems() {
  const enteredPass = prompt("🔑 Enter your login password to RESTORE items:");
  const storedPass = localStorage.getItem("password") || "developer";
  if (!enteredPass) return;
  if (enteredPass !== storedPass) return alert("❌ Incorrect password!");

  showConfirm("⚠️ This will restore all returned items back to inventory. Continue?", (yes) => {
    if (!yes) return;

    showLoading("🔄 Restoring items... please wait...");

    setTimeout(() => {
      const history = JSON.parse(localStorage.getItem("history")) || [];
      const inventory = JSON.parse(localStorage.getItem("inventoryData")) || [];

      history.forEach(entry => {
        if (entry.status === "Returned" && entry.itemCodes) {
          const item = inventory.find(i => i.name === entry.item);
          if (item) {
            entry.itemCodes.forEach(code => {
              if (!item.codes.includes(code)) {
                item.codes.push(code);
                item.available = (item.available || 0) + 1;
              }
            });
          }
        }
      });

      localStorage.setItem("inventoryData", JSON.stringify(inventory));

      hideLoading();

      const successOverlay = document.createElement("div");
      successOverlay.classList.add("success-overlay");
      successOverlay.innerHTML = `
        <div class="success-box">
          <h2>✅ Items Successfully Restored!</h2>
          <p>All returned items have been restored to inventory.</p>
          <button id="okSuccess">OK</button>
        </div>
      `;
      document.body.appendChild(successOverlay);

      document.getElementById("okSuccess").onclick = () => {
        successOverlay.remove();
        addNotification("🔄 Items restored to inventory.");
        location.reload();
      };
    }, 2000);
  });
}

// ==========================
// LOGOUT
// ==========================
function logout() {
  if (!confirm("🚪 Are you sure you want to log out?")) return;

  try {
    // Clear all session and user data
    localStorage.removeItem("currentUser");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("fullscreenMode");
    
    // Show loading message
    showLoading("🔒 Logging out... please wait...");

    // Redirect after short delay
    setTimeout(() => {
      hideLoading();
      // Add logout notification
      const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
      notifications.unshift({ 
        message: "🚪 Logged out successfully", 
        time: new Date().toLocaleString() 
      });
      localStorage.setItem("notifications", JSON.stringify(notifications));
      
      // Redirect to login page
      window.location.replace("admin-login.html");
    }, 1000);
  } catch (err) {
    console.error("Logout error:", err);
    window.location.replace("admin-login.html");
  }
}

// ==========================
// LOADING MODAL
// ==========================
function showLoading(msg) {
  loadingText.textContent = msg;
  loadingModal.style.display = "flex";
}
function hideLoading() {
  loadingModal.style.display = "none";
}

// ==========================
// NOTIFICATIONS (UPGRADED)
// ==========================
function addNotification(message) {
  const timestamp = `${new Date().toLocaleDateString()} ${getFormattedTime()}`;
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
  notifications.unshift({ message, time: timestamp });
  localStorage.setItem("notifications", JSON.stringify(notifications));
  updateNotifications();
  playNotificationSound();
}

function updateNotifications() {
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
  notifList.innerHTML = notifications.length
    ? notifications.map(n => `<li>${n.message}<br><small>${n.time}</small></li>`).join("")
    : `<li>No notifications yet</li>`;
  notifBtn.classList.toggle("has-new", notifications.length > 0);
}

notifBtn.addEventListener("click", () => {
  notifDropdown.classList.toggle("show");
  notifBtn.classList.remove("has-new");
});

const clearBtn = document.createElement("button");
clearBtn.textContent = "Clear Notifications";
clearBtn.classList.add("clear-notif");
clearBtn.onclick = () => { localStorage.removeItem("notifications"); updateNotifications(); };
notifDropdown.appendChild(clearBtn);

// ==========================
// AUTO-DETECT UNRETURNED ITEMS (SMART REMINDER)
// ==========================
function checkUnreturnedItems() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Trigger only between 4:30 PM and 5:00 PM
  if ((hour === 16 && minute >= 30) || (hour === 17 && minute < 5)) {
    const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
    const unreturned = transactions.filter(t => 
      t.status === "Not Returned" || t.status === "Borrowed"
    );

    if (unreturned.length > 0) {
      unreturned.forEach(t => {
        const borrower = t.name || t.borrower || "Unknown Borrower";
        const item = t.item || "Unknown Item";
        addNotification(`⏰ Reminder: ${borrower} has not returned ${item} yet! Please return before 5:00 PM.`);
      });
      showNotice("⏰ Pending Returns", `${unreturned.length} borrowers still have items not yet returned.`);
    }
  }
}

setInterval(checkUnreturnedItems, 60000); // check every minute

// ==========================
// DEFAULT INITIALIZATION
// ==========================
if (!localStorage.getItem("adminPass")) localStorage.setItem("adminPass", "12345");
if (!localStorage.getItem("adminUsername")) localStorage.setItem("adminUsername", "admin");
if (!localStorage.getItem("securityKey")) localStorage.setItem("securityKey", "12345");
updateNotifications();

// Restore fullscreen preference
window.addEventListener("DOMContentLoaded", () => {
  const isFullscreen = localStorage.getItem("fullscreenMode") === "true";
  if (isFullscreen) {
    document.body.classList.add("fullscreen-mode");
  }
});

// ==========================
// FULLSCREEN TOGGLE FUNCTION
// ==========================
function toggleFullscreen() {
  const body = document.body;
  const btn = document.getElementById("fullscreenToggle");
  
  body.classList.toggle("fullscreen-mode");
  
  if (body.classList.contains("fullscreenMode")) {
    localStorage.setItem("fullscreenMode", "true");
  } else {
    localStorage.setItem("fullscreenMode", "false");
  }
}

// ========== DEVELOPER MANAGEMENT SYSTEM ==========

let developers = [];

// Load developers from localStorage
function loadDevelopers() {
  try {
    const saved = localStorage.getItem("developers");
    developers = saved ? JSON.parse(saved) : [];
    console.log("✅ Developers loaded:", developers);
    renderDevelopers();
  } catch (e) {
    console.error("Error loading developers:", e);
    developers = [];
    renderDevelopers();
  }
}

// Save developers to localStorage
function saveDevelopers() {
  try {
    localStorage.setItem("developers", JSON.stringify(developers));
    console.log("✅ Developers saved");
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      alert("❌ Storage limit exceeded.");
    } else {
      alert("❌ Error saving: " + e.message);
    }
    console.error("Error saving developers:", e);
  }
}

// Render developer slots
function renderDevelopers() {
  const slotsContainer = document.getElementById("developerSlots");
  
  if (!slotsContainer) return;
  
  // Ensure we have exactly 6 developer slots
  while (developers.length < 6) {
    developers.push({
      name: "",
      role: "",
      skills: "",
      image: ""
    });
  }

  slotsContainer.innerHTML = developers.slice(0, 6).map((dev, index) => `
    <div class="developer-slot" id="devSlot${index}">
      <div class="slot-header">
        <h3>Developer ${index + 1}</h3>
      </div>
      
      <div class="slot-content">
        <!-- Image Section -->
        <div class="image-section">
          <img src="${dev.image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Crect fill=%22%23e9ecef%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2240%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22%3E?%3C/text%3E%3C/svg%3E'}" 
               alt="Developer ${index + 1}" 
               class="dev-slot-image" 
               id="devImage${index}">
          <input type="file" 
                 id="devImageInput${index}" 
                 accept="image/*" 
                 style="display: none;"
                 onchange="updateDevImage(${index})">
          <button class="upload-btn" onclick="document.getElementById('devImageInput${index}').click()">
            📸 Upload Image
          </button>
        </div>

        <!-- Form Section -->
        <div class="form-section">
          <div class="form-group">
            <label>Developer Name</label>
            <input type="text" 
                   id="devName${index}" 
                   placeholder="Enter name"
                   value="${dev.name || ''}"
                   onchange="updateDevField(${index}, 'name', this.value)">
          </div>

          <div class="form-group">
            <label>Role / Position</label>
            <input type="text" 
                   id="devRole${index}" 
                   placeholder="Enter role"
                   value="${dev.role || ''}"
                   onchange="updateDevField(${index}, 'role', this.value)">
          </div>

          <div class="form-group">
            <label>Skills</label>
            <textarea id="devSkills${index}" 
                      placeholder="Enter skills"
                      rows="2"
                      onchange="updateDevField(${index}, 'skills', this.value)">${dev.skills || ''}</textarea>
          </div>

          <button class="save-btn" onclick="saveDeveloperSlot(${index})">💾 Save</button>
        </div>
      </div>
    </div>
  `).join("");
}

// Update developer field
function updateDevField(index, field, value) {
  if (developers[index]) {
    developers[index][field] = value;
  }
}

// Update developer image
function updateDevImage(index) {
  const fileInput = document.getElementById(`devImageInput${index}`);
  const file = fileInput.files[0];
  
  if (file && file.type.startsWith('image/')) {
    if (file.size > 2 * 1024 * 1024) {
      alert("❌ File size must be less than 2MB");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      developers[index].image = e.target.result;
      document.getElementById(`devImage${index}`).src = e.target.result;
      saveDevelopers();
      addNotification("✅ Image uploaded!");
    };
    reader.readAsDataURL(file);
  }
}

// Save developer slot
function saveDeveloperSlot(index) {
  const name = document.getElementById(`devName${index}`).value.trim();
  const role = document.getElementById(`devRole${index}`).value.trim();
  const skills = document.getElementById(`devSkills${index}`).value.trim();
  
  if (!name || !role || !skills) {
    alert("⚠️ Please fill in all fields");
    return;
  }
  
  developers[index] = {
    name: name,
    role: role,
    skills: skills,
    image: developers[index].image || ""
  };
  
  saveDevelopers();
  addNotification("💾 Developer saved!");
}

// ========== ARCHIVE FUNCTIONS ==========
function loadArchive() {
  const archive = JSON.parse(localStorage.getItem("archive")) || [];
  const archiveBody = document.getElementById("archiveBody");
  
  if (!archiveBody) return;
  
  archiveBody.innerHTML = "";
  
  if (archive.length === 0) {
    archiveBody.innerHTML = `
      <tr id="emptyArchiveRow">
        <td colspan="8" style="text-align:center; color:gray; font-style:italic; padding:20px;">
          No archived records yet.
        </td>
      </tr>`;
    return;
  }
  
  archive.forEach((record, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${record.borrowerId || "-"}</td>
      <td>${record.studentName || "Unknown"}</td>
      <td>${record.item || "-"}</td>
      <td>${record.quantity || "-"}</td>
      <td>${record.borrowedAt || "-"}</td>
      <td>${record.returnedAt || "-"}</td>
      <td>${record.archivedAt || "-"}</td>
      <td><button class="restore-btn" onclick="restoreArchiveRecord(${index})" title="Restore this record"><i class="fa-solid fa-undo"></i></button></td>
    `;
    archiveBody.appendChild(tr);
  });
}

function restoreArchiveRecord(index) {
  if (confirm("Restore this record to transaction history?")) {
    const archive = JSON.parse(localStorage.getItem("archive")) || [];
    const history = JSON.parse(localStorage.getItem("history")) || [];
    
    if (index >= 0 && index < archive.length) {
      const record = archive[index];
      delete record.archivedAt; // Remove archived timestamp
      history.push(record);
      
      archive.splice(index, 1);
      
      localStorage.setItem("archive", JSON.stringify(archive));
      localStorage.setItem("history", JSON.stringify(history));
      
      loadArchive();
      addNotification("✅ Record restored to history!");
    }
  }
}

function restoreAllArchive() {
  if (confirm("Restore ALL archived records to transaction history?")) {
    if (confirm("Are you absolutely sure?")) {
      const archive = JSON.parse(localStorage.getItem("archive")) || [];
      const history = JSON.parse(localStorage.getItem("history")) || [];
      
      archive.forEach(record => {
        delete record.archivedAt;
        history.push(record);
      });
      
      localStorage.setItem("archive", JSON.stringify([]));
      localStorage.setItem("history", JSON.stringify(history));
      
      loadArchive();
      addNotification("✅ All records restored to history!");
    }
  }
}

function clearAllArchive() {
  if (confirm("Permanently delete all archived records?")) {
    if (confirm("This cannot be undone. Are you absolutely sure?")) {
      localStorage.removeItem("archive");
      loadArchive();
      addNotification("🗑️ Archive cleared!");
    }
  }
}

function searchArchive() {
  const searchTerm = document.getElementById("archiveSearch").value.toLowerCase();
  const archive = JSON.parse(localStorage.getItem("archive")) || [];
  const archiveBody = document.getElementById("archiveBody");
  
  archiveBody.innerHTML = "";
  
  const filtered = archive.filter(record => 
    (record.borrowerId || "").toLowerCase().includes(searchTerm) ||
    (record.studentName || "").toLowerCase().includes(searchTerm) ||
    (record.item || "").toLowerCase().includes(searchTerm)
  );
  
  if (filtered.length === 0) {
    archiveBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; color:gray; font-style:italic; padding:20px;">
          No matching records found.
        </td>
      </tr>`;
    return;
  }
  
  filtered.forEach((record, displayIndex) => {
    const actualIndex = archive.indexOf(record);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${record.borrowerId || "-"}</td>
      <td>${record.studentName || "Unknown"}</td>
      <td>${record.item || "-"}</td>
      <td>${record.quantity || "-"}</td>
      <td>${record.borrowedAt || "-"}</td>
      <td>${record.returnedAt || "-"}</td>
      <td>${record.archivedAt || "-"}</td>
      <td><button class="restore-btn" onclick="restoreArchiveRecord(${actualIndex})" title="Restore this record"><i class="fa-solid fa-undo"></i></button></td>
    `;
    archiveBody.appendChild(tr);
  });
}

// Add search event listener for archive
document.addEventListener("DOMContentLoaded", () => {
  const archiveSearch = document.getElementById("archiveSearch");
  if (archiveSearch) {
    archiveSearch.addEventListener("keyup", searchArchive);
  }
  loadArchive();
});

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadDevelopers();
    loadArchive();
  });
} else {
  loadDevelopers();
  loadArchive();
}
