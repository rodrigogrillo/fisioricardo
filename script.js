// Ano no rodapé
document.getElementById('year').textContent = new Date().getFullYear();

// Menu mobile
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
navToggle.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});
mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Barra de progresso de rolagem (assinatura visual sutil, ligada ao motivo do arco)
const progressBar = document.querySelector('.arc-progress');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progressBar.style.width = scrolled + '%';
});

// Feedback do formulário (funciona com Netlify Forms; fallback amigável fora do Netlify)
const form = document.querySelector('.contato-form');
const note = document.getElementById('formNote');
if (form) {
  form.addEventListener('submit', (e) => {
    // Em produção no Netlify, o próprio Netlify intercepta o POST.
    // Este handler só cuida do feedback visual imediato.
    if (!window.location.hostname.includes('netlify') && window.location.hostname !== '') {
      // fora do ambiente Netlify (ex: preview local), evita erro 404 no submit
      e.preventDefault();
      note.textContent = 'No site publicado no Netlify, sua mensagem será enviada por aqui automaticamente.';
      note.classList.add('success');
    }
  });
}
