(function () {
  const openBtn = document.getElementById('open-profile-btn');
  const modal = document.getElementById('profile-modal');
  const backdrop = document.getElementById('profile-backdrop');
  const closeBtn = document.getElementById('close-profile-btn');
  const cancelBtn = document.getElementById('profile-cancel');
  const form = document.getElementById('profile-form');
  const photoInput = document.getElementById('profile-photo');
  const preview = document.getElementById('profile-photo-preview');

  function open() { modal.style.display = 'block'; }
  function close() { modal.style.display = 'none'; }

  openBtn?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  cancelBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);

  photoInput?.addEventListener('change', (e) => {
    const f = e.target.files?.[0];
    if (!f) { preview.innerHTML = ''; return; }
    const img = document.createElement('img');
    img.style.maxWidth = '120px';
    img.style.borderRadius = '6px';
    img.src = URL.createObjectURL(f);
    preview.innerHTML = '';
    preview.appendChild(img);
  });

  form?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const data = new FormData(form);
    // Optionally include file upload as FormData. Here we POST to /api/profile
    try {
      const res = await fetch('/api/profile', { method: 'POST', body: data });
      if (!res.ok) throw new Error('Failed to save profile');
      // success feedback
      close();
      alert('Profile saved');
    } catch (err) {
      console.error(err);
      alert('Error saving profile');
    }
  });
})();