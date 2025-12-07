(function () {
  const form = document.getElementById("edit-profile-form");
  const nameInput = document.getElementById("name");
  const ageInput = document.getElementById("age");
  const genderInput = document.getElementById("gender");
  const phoneInput = document.getElementById("phone");
  const passwordInput = document.getElementById("password");
  const photoPreview = document.getElementById("photo-preview");
  const DEFAULT_AVATAR_DATAURL = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect fill='%230e1720' width='100%' height='100%'/><g fill='%23ffffff' opacity='0.9'><circle cx='60' cy='40' r='24'/><path d='M30 94c0-17 26-26 30-26s30 9 30 26v6H30v-6z'/></g></svg>";
  let photoDataUrl = null; // holds existing url for preview

  async function loadProfile() {
    try {
      const res = await fetch("/api/profile", { credentials: "include" });
      if (!res.ok) {
        // not authenticated or forbidden — redirect to sign-in
        window.location.href = "/index.html";
        return;
      }
      const data = await res.json();
      const u = data.user || {};
      nameInput.value = u.name || "";
      ageInput.value = u.age || "";
      genderInput.value = u.gender || "";
      phoneInput.value = u.phone || "";
      photoDataUrl = u.photo || null;
      if (photoPreview) {
        photoPreview.innerHTML = '';
        const img = document.createElement('img');
        img.src = u.photo || DEFAULT_AVATAR_DATAURL;
        img.style.width = '96px';
        img.style.height = '96px';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        photoPreview.appendChild(img);
      }
    } catch (err) {
      console.error(err);
      // failed to load — redirect to sign-in
      window.location.href = "/index.html";
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
    // If user selected a new file, upload it first to /api/profile/photo
    // No upload support in UI yet — keep existing photo (server will retain current value)
    if (photoDataUrl) payload.photo = photoDataUrl;

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          window.location.href = "/index.html";
          return;
        }
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

  // No upload control present in the page; uploads are coming soon.

  // Initialize
  loadProfile();
})();
