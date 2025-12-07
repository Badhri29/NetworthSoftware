const DEFAULT_AVATAR_DATAURL = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect fill='%230e1720' width='100%' height='100%'/><g fill='%23ffffff' opacity='0.9'><circle cx='60' cy='40' r='24'/><path d='M30 94c0-17 26-26 30-26s30 9 30 26v6H30v-6z'/></g></svg>";
let photoDataUrl = null;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const user = await getCurrentUser();
    const userEl = document.getElementById("settings-user");
    userEl.textContent = `${user.email} • Member since ${new Date(
      user.createdAt
    ).toLocaleDateString()}`;
    hookPasswordForm();
    await loadProfile();
    hookProfileForm();
  } catch (err) {
    console.error(err);
  }
});

function hookPasswordForm() {
  const form = document.getElementById("password-form");
  const msgEl = document.getElementById("pwd-message");
  const errEl = document.getElementById("pwd-error");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msgEl.style.display = "none";
    errEl.style.display = "none";
    msgEl.textContent = "";
    errEl.textContent = "";
    try {
      const current = document.getElementById("pwd-current").value;
      const next = document.getElementById("pwd-new").value;
      if (!current || !next) {
        throw new Error("Both fields are required.");
      }
      await apiRequest("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      msgEl.textContent = "Password updated.";
      msgEl.style.display = "block";
      form.reset();
    } catch (err) {
      errEl.textContent = err.message || "Failed to update password.";
      errEl.style.display = "block";
    }
  });
}

async function loadProfile() {
  try {
    const res = await fetch("/api/profile", { credentials: "include" });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        window.location.href = "/index.html";
      }
      return;
    }
    const data = await res.json();
    const u = data.user || {};
    const nameInput = document.getElementById("name");
    const ageInput = document.getElementById("age");
    const genderInput = document.getElementById("gender");
    const phoneInput = document.getElementById("phone");
    const photoPreview = document.getElementById("photo-preview");

    if (nameInput) nameInput.value = u.name || "";
    if (ageInput) ageInput.value = u.age || "";
    if (genderInput) genderInput.value = u.gender || "";
    if (phoneInput) phoneInput.value = u.phone || "";
    
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
    console.error("Failed to load profile:", err);
  }
}

function hookProfileForm() {
  const form = document.getElementById("edit-profile-form");
  const profileError = document.getElementById("profile-error");
  if (!form) return;

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (profileError) profileError.textContent = "";

    const nameInput = document.getElementById("name");
    const ageInput = document.getElementById("age");
    const genderInput = document.getElementById("gender");
    const phoneInput = document.getElementById("phone");

    const payload = {
      name: nameInput?.value || "",
      age: ageInput?.value || "",
      gender: genderInput?.value || "",
      phone: phoneInput?.value || "",
    };

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
      if (profileError) {
        profileError.textContent = "Profile updated successfully!";
        profileError.style.color = "green";
      } else {
        alert("Profile updated");
      }
      setTimeout(() => loadProfile(), 500);
    } catch (err) {
      console.error(err);
      if (profileError) {
        profileError.textContent = "Could not save profile: " + err.message;
        profileError.style.color = "red";
      } else {
        alert("Could not save profile: " + err.message);
      }
    }
  });
}
