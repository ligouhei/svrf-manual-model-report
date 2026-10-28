(() => {
  const questions = [...document.querySelectorAll('.question-list > .bench-question')];
  const groups = [...document.querySelectorAll('.evidence-group')];
  const search = document.getElementById('question-search');
  const errorsOnly = document.getElementById('errors-only');
  const count = document.getElementById('question-count');
  const filter = () => {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    questions.forEach(question => {
      const title = question.querySelector('summary').textContent.toLowerCase();
      const match = (!query || title.includes(query)) && (!errorsOnly.checked || question.dataset.hasError === 'true');
      question.hidden = !match;
      if (match) visible++;
    });
    groups.forEach(group => {
      group.hidden = ![...group.querySelectorAll('.question-list > .bench-question')].some(question => !question.hidden);
      if (query || errorsOnly.checked) group.open = true;
    });
    count.textContent = visible === 20 ? '共 20 题' : `显示 ${visible} / 20 题`;
  };
  search.addEventListener('input', filter);
  errorsOnly.addEventListener('change', filter);
  document.getElementById('expand-questions').addEventListener('click', () => {
    groups.filter(group => !group.hidden).forEach(group => { group.open = true; });
    questions.filter(question => !question.hidden).forEach(question => { question.open = true; });
  });
  document.getElementById('collapse-questions').addEventListener('click', () => {
    questions.forEach(question => { question.open = false; });
    groups.forEach(group => { group.open = false; });
  });
  function revealHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    if (target.matches('.bench-question, .evidence-group')) {
      search.value = '';
      errorsOnly.checked = false;
      filter();
      if (target.tagName === 'DETAILS') target.open = true;
      for (let parent = target.parentElement; parent; parent = parent.parentElement) {
        if (parent.tagName === 'DETAILS') parent.open = true;
      }
      requestAnimationFrame(() => target.scrollIntoView({block: 'start'}));
    }
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.getElementById(link.hash.slice(1));
    if (target && target.matches('.bench-question, .evidence-group')) {
      event.preventDefault();
      history.pushState(null, '', link.hash);
      revealHash();
    }
  });
  window.addEventListener('hashchange', revealHash);
  revealHash();
  const navLinks = [...document.querySelectorAll('.sidebar nav a')];
  const sections = [...document.querySelectorAll('main > section')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach(entry => {
        navLinks.forEach(link => {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, {rootMargin: '-10% 0px -70% 0px', threshold: 0});
    sections.forEach(section => observer.observe(section));
  }
  const print = () => {
    const changed = [...document.querySelectorAll('details:not([open])')];
    changed.forEach(details => { details.open = true; });
    const restore = () => {
      changed.forEach(details => { details.open = false; });
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    window.print();
  };
  document.getElementById('print').addEventListener('click', print);
})();
