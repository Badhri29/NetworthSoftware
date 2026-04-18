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
    try {
      // Collect form data
      const formData = new FormData(form);
      const body = {
        name: formData.get('name'),
        age: formData.get('age'),
        gender: formData.get('gender'),
        phone: formData.get('phone'),
        password: formData.get('password')
      };
      
      const res = await fetch('/api/profile', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) throw new Error('Failed to save profile');
      
      // Handle file upload if image selected
      const photoFile = document.querySelector('input[type="file"]').files[0];
      if (photoFile) {
        const photoForm = new FormData();
        photoForm.append('photo', photoFile);
        const photoRes = await fetch('/api/profile/photo', { 
          method: 'POST', 
          body: photoForm
        });
        if (!photoRes.ok) throw new Error('Failed to upload photo');
      }
      
      // success feedback
      close();
      alert('Profile saved');
      location.reload();
    } catch (err) {
      console.error(err);
      alert('Error saving profile: ' + err.message);
    }
  });
})();