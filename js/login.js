document.getElementById("loginForm").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent form submission

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMessage = document.getElementById("errorMessage");

  // Get stored credentials from localStorage
  const storedUser = localStorage.getItem("adminUser") || "admin";
  const storedPass = localStorage.getItem("adminPass") || "developer";

  console.log("Attempting login with:", username, password);  // For debugging
  console.log("Stored creds:", storedUser, storedPass);      // For debugging

  // Check credentials
  if (username === storedUser && password === storedPass) {
    console.log("Login successful!");  // For debugging
    // Successful login: Redirect to home page
    window.location.href = "dashboard.html";
  } else {
    console.log("Login failed.");  // For debugging
    // Failed login: Show error
    errorMessage.textContent = "❌ Invalid username or password. Please try again.";
    errorMessage.style.display = "block";
  }
});

// Forgot Password functionality - Redirect to reset password page
document.getElementById("forgotPasswordLink").addEventListener("click", function (event) {
  event.preventDefault();

  // Redirect to the reset password page (assuming it's named "reset.html")
  window.location.href = "reset password.html";
});

