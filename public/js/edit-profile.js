(function () {
  const form = document.getElementById("edit-profile-form");
  const nameInput = document.getElementById("name");
  const ageInput = document.getElementById("age");
  const genderInput = document.getElementById("gender");
  const phoneInput = document.getElementById("phone");
  const passwordInput = document.getElementById("password");

  async function loadProfile() {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Not authenticated or failed to load profile");
      const data = await res.json();
      const u = data.user || {};
      nameInput.value = u.name || "";
      ageInput.value = u.age || "";
      genderInput.value = u.gender || "";
      phoneInput.value = u.phone || "";
    } catch (err) {
      console.error(err);
      alert("Failed to load profile. Are you signed in?");
    }
  }

  form?.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const payload = {
      name: nameInput.value,
      age: ageInput.value,
      gender: genderInput.value,
      phone: phoneInput.value,
    };
    if (passwordInput.value) payload.password = passwordInput.value;

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save profile");
      }
      alert("Profile updated");
      // optionally redirect back to dashboard
      window.location.href = "/dashboard.html";
    } catch (err) {
      console.error(err);
      alert("Could not save profile: " + err.message);
    }
  });

  // Initialize
  loadProfile();
})();
