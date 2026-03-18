// Profile modal and save/load logic
(function () {
  function createModal() {
    if (document.getElementById("editProfileModal")) return;
    const modal = document.createElement("div");
    modal.id = "editProfileModal";
    modal.className = "modal-overlay";
    modal.style.display = "none";
    modal.innerHTML = `
      <div class="modal-content" style="max-width:420px;">
        <button class="modal-close" onclick="closeEditProfile()">&times;</button>
        <h2>Edit Profile</h2>
        <label style="display:block;margin-top:15px;color:#333333;font-weight:600;">Name</label>
        <input id="editProfileName" type="text" style="width:100%;padding:12px;border-radius:8px;border:1px solid #ccc;color:#1a1a1a;background:#ffffff;box-sizing:border-box;">
        <label style="display:block;margin-top:15px;color:#333333;font-weight:600;">Email</label>
        <input id="editProfileEmail" type="email" style="width:100%;padding:12px;border-radius:8px;border:1px solid #ccc;color:#1a1a1a;background:#ffffff;box-sizing:border-box;">
        <label style="display:block;margin-top:15px;color:#333333;font-weight:600;">Avatar (optional)</label>
        <input id="editProfileAvatar" type="file" accept="image/*" style="width:100%;color:#1a1a1a;">
        <div id="editAvatarPreview" style="margin-top:15px"></div>
        <div style="margin-top:20px;text-align:right;gap:12px;display:flex;justify-content:flex-end;">
          <button onclick="closeEditProfile()" class="cancel-btn" style="padding:10px 24px;background:#f5f5f5;border:1px solid #ddd;border-radius:8px;color:#333333;font-weight:600;cursor:pointer;font-size:14px;">Cancel</button>
          <button onclick="saveProfile()" class="action-btn" style="padding:10px 24px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);border:none;border-radius:8px;color:white;font-weight:600;cursor:pointer;font-size:14px;">SAVE</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // preview on file select
    const fileInput = modal.querySelector("#editProfileAvatar");
    fileInput.addEventListener("change", function (e) {
      const preview = modal.querySelector("#editAvatarPreview");
      preview.innerHTML = "";
      const f = e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = function (ev) {
        const img = document.createElement("img");
        img.src = ev.target.result;
        img.style.maxWidth = "80px";
        img.style.borderRadius = "8px";
        preview.appendChild(img);
      };
      reader.readAsDataURL(f);
    });

    // close when clicking overlay
    modal.addEventListener("click", function (ev) {
      if (ev.target === modal) closeEditProfile();
    });
  }

  window.showEditProfile = function () {
    createModal();
    const modal = document.getElementById("editProfileModal");
    const name =
      localStorage.getItem("adminUsername") ||
      (document.getElementById("profileUsername") &&
        document.getElementById("profileUsername").textContent) ||
      "Administrator";
    const email =
      localStorage.getItem("adminEmail") ||
      (document.getElementById("profileEmail") &&
        document.getElementById("profileEmail").textContent) ||
      "";
    modal.querySelector("#editProfileName").value = name;
    modal.querySelector("#editProfileEmail").value = email;
    modal.querySelector("#editAvatarPreview").innerHTML = "";
    const avatarData = localStorage.getItem("adminAvatar");
    if (avatarData) {
      const img = document.createElement("img");
      img.src = avatarData;
      img.style.maxWidth = "80px";
      img.style.borderRadius = "8px";
      modal.querySelector("#editAvatarPreview").appendChild(img);
    }
    modal.style.display = "flex";
  };

  window.closeEditProfile = function () {
    const modal = document.getElementById("editProfileModal");
    if (modal) modal.style.display = "none";
  };

  window.saveProfile = function () {
    const modal = document.getElementById("editProfileModal");
    if (!modal) return;
    const name =
      modal.querySelector("#editProfileName").value || "Administrator";
    const email = modal.querySelector("#editProfileEmail").value || "";
    const fileInput = modal.querySelector("#editProfileAvatar");

    function finalize(avatarData) {
      localStorage.setItem("adminUsername", name);
      localStorage.setItem("adminEmail", email);
      if (avatarData) localStorage.setItem("adminAvatar", avatarData);
      applyProfileToUI(name, email, avatarData);
      closeEditProfile();
    }

    if (fileInput && fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        finalize(ev.target.result);
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      finalize(localStorage.getItem("adminAvatar"));
    }
  };

  function applyProfileToUI(name, email, avatarData) {
    const usernameEls = document.querySelectorAll("#profileUsername");
    usernameEls.forEach((el) => (el.textContent = name));
    const emailEls = document.querySelectorAll("#profileEmail");
    emailEls.forEach((el) => (el.textContent = email));

    // top button
    const btn = document.querySelector(".admin-profile-btn");
    if (btn) {
      if (avatarData) {
        btn.innerHTML =
          '<img src="' +
          avatarData +
          '" class="admin-avatar-img" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">';
      } else {
        btn.innerHTML =
          '<i class="fa-solid fa-user admin-avatar-icon" aria-hidden="true"></i>';
      }
    }

    // dropdown header avatar
    const headerIcon = document.querySelector(".profile-avatar-icon");
    if (headerIcon) {
      if (avatarData) {
        const img = document.createElement("img");
        img.src = avatarData;
        img.className = "profile-avatar-img";
        img.style.width = "56px";
        img.style.height = "56px";
        img.style.borderRadius = "12px";
        img.style.objectFit = "cover";
        headerIcon.replaceWith(img);
      } else {
        // ensure icon exists
        // nothing to do if icon already present
      }
    }
  }

  // run on load to apply stored profile
  document.addEventListener("DOMContentLoaded", function () {
    createModal();
    const name = localStorage.getItem("adminUsername");
    const email = localStorage.getItem("adminEmail");
    const avatar = localStorage.getItem("adminAvatar");
    if (name || email || avatar)
      applyProfileToUI(
        name || "Administrator",
        email || "admin@logbook.com",
        avatar,
      );
  });
})();
