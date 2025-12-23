document.addEventListener('DOMContentLoaded', () => {
  const typeButtons = document.querySelectorAll('.cat-type-btn');
  const section = document.querySelector('.edit-categories-section');

  if (!section) return;

  /* ✅ DEFAULT: Income active */
  section.classList.add('income');

  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;

      // reset buttons
      typeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // reset section colors
      section.classList.remove('income', 'expense', 'savings');

      // apply selected color
      section.classList.add(type);
    });
  });
});
