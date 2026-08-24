// ── 1. PREPARAÇÃO DOS CARDS DE CATEGORIA ──
const prepareCategoryCards = () => {
  document.querySelectorAll('.card-dep').forEach((card) => {
    if (!card.classList.contains('card-ready')) {
      card.classList.add('card-ready');
    }
  });
};

prepareCategoryCards();

// ── 2. REVEAL AO SCROLL (INTERSECTION OBSERVER) ──
const reveals = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), index * 80);
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach((item) => observer.observe(item));
} else {
  reveals.forEach((item) => item.classList.add('visible'));
}

// ── 3. FAQ ACCORDION ──
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach((item) => {
  const trigger = item.querySelector('.faq-trigger');

  trigger.addEventListener('click', () => {
    const isActive = item.classList.contains('active');

    faqItems.forEach((faq) => {
      faq.classList.remove('active');
      faq.querySelector('.faq-content').style.maxHeight = null;
    });

    if (!isActive) {
      item.classList.add('active');
      const content = item.querySelector('.faq-content');
      content.style.maxHeight = `${content.scrollHeight}px`;
    }
  });
});

// ── 4. REDIRECIONAR CARDS DE CATEGORIA PARA O NOVO CATÁLOGO EXTERNO (DELEGAÇÃO DE EVENTOS) ──
document.addEventListener('click', (event) => {
  const card = event.target.closest('.card-dep[data-category]');
  if (card) {
    if (event.target.closest('a')) return;
    const cat = card.dataset.category;
    if (cat) {
      window.location.href = `./html/catalogo.html?cat=${cat}`;
    }
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const card = event.target.closest('.card-dep[data-category]');
  if (card) {
    event.preventDefault();
    const cat = card.dataset.category;
    if (cat) {
      window.location.href = `./html/catalogo.html?cat=${cat}`;
    }
  }
});

// ── 5. CARROSSEL MANUAL PREMIUM INFINITO (TRANSFORM-BASED) ──
const setupGeneralSlider = (wrapperId, itemsPerViewMobile = 1, itemsPerViewDesktop = 3) => {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return null;

  const container = wrapper.querySelector('.premium-slider-container');
  const track = wrapper.querySelector('.premium-slider-track');
  const prevBtn = wrapper.querySelector('.slider-arrow.prev');
  const nextBtn = wrapper.querySelector('.slider-arrow.next');
  const dotsContainer = wrapper.querySelector('.slider-dots');

  if (!track || !container) return null;

  // Remove clones anteriores
  Array.from(track.querySelectorAll('.slider-clone')).forEach(clone => clone.remove());

  let originalItems = Array.from(track.children);
  if (originalItems.length === 0) return null;

  const getItemsPerView = () => {
    return window.innerWidth <= 768 ? itemsPerViewMobile : itemsPerViewDesktop;
  };

  const itemsPerViewMax = Math.max(itemsPerViewMobile, itemsPerViewDesktop);
  
  // Clona itens no início e no fim
  for (let i = 0; i < itemsPerViewMax; i++) {
    const cloneFirst = originalItems[i].cloneNode(true);
    cloneFirst.classList.add('slider-clone');
    track.appendChild(cloneFirst);
  }
  for (let i = originalItems.length - 1; i >= originalItems.length - itemsPerViewMax; i--) {
    const cloneLast = originalItems[i].cloneNode(true);
    cloneLast.classList.add('slider-clone');
    track.insertBefore(cloneLast, track.firstChild);
  }

  let allItems = Array.from(track.children);
  let currentIdx = itemsPerViewMax; 
  let isTransitioning = false;

  const updateSlider = (smooth = true) => {
    const itemsPerView = getItemsPerView();
    const containerWidth = container.getBoundingClientRect().width;
    const gap = itemsPerView === 1 ? 12 : 24;
    
    let itemWidth = 0;
    if (itemsPerView === 1) {
      itemWidth = containerWidth * 0.85;
    } else {
      itemWidth = (containerWidth - (gap * (itemsPerView - 1))) / itemsPerView;
    }

    let offset = 0;
    if (itemsPerView === 1) {
      const centerPadding = (containerWidth - itemWidth) / 2;
      offset = currentIdx * (itemWidth + gap) - centerPadding;
    } else {
      offset = currentIdx * (itemWidth + gap);
    }

    if (smooth) {
      track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
    } else {
      track.style.transition = 'none';
    }

    track.style.transform = `translate3d(-${offset}px, 0, 0)`;

    if (!smooth) {
      track.offsetHeight; // Força reflow
    }

    // Atualiza dots correspondentes
    if (dotsContainer) {
      const originalIdx = (currentIdx - itemsPerViewMax + originalItems.length) % originalItems.length;
      dotsContainer.querySelectorAll('.slider-dot').forEach((dot, idx) => {
        dot.classList.toggle('active', idx === originalIdx);
      });
    }
  };

  const checkIndexLimits = () => {
    // Se ultrapassou os limites originais, reseta instantaneamente (sem transição)
    if (currentIdx < itemsPerViewMax) {
      currentIdx = originalItems.length + currentIdx;
      updateSlider(false);
    } else if (currentIdx >= originalItems.length + itemsPerViewMax) {
      currentIdx = currentIdx - originalItems.length;
      updateSlider(false);
    }
    isTransitioning = false;
  };

  // Suporte a gestos touch no celular
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  container.addEventListener('touchstart', (e) => {
    if (isTransitioning) return;
    startX = e.touches[0].clientX;
    currentX = startX;
    isDragging = true;
    track.style.transition = 'none';
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
    const diff = currentX - startX;

    const itemsPerView = getItemsPerView();
    const containerWidth = container.getBoundingClientRect().width;
    const gap = itemsPerView === 1 ? 12 : 24;
    const itemWidth = itemsPerView === 1 ? containerWidth * 0.85 : (containerWidth - (gap * (itemsPerView - 1))) / itemsPerView;
    const centerPadding = itemsPerView === 1 ? (containerWidth - itemWidth) / 2 : 0;
    const baseOffset = currentIdx * (itemWidth + gap) - centerPadding;

    track.style.transform = `translate3d(-${baseOffset - diff}px, 0, 0)`;
  }, { passive: true });

  container.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    const diff = currentX - startX;

    if (Math.abs(diff) > 50) {
      isTransitioning = true;
      if (diff > 0) {
        currentIdx--;
      } else {
        currentIdx++;
      }
      updateSlider(true);
      setTimeout(checkIndexLimits, 400);
    } else {
      updateSlider(true);
    }
  });

  const rebuildDots = () => {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < originalItems.length; i++) {
      const dot = document.createElement('div');
      dot.className = 'slider-dot';
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIdx = i + itemsPerViewMax;
        updateSlider(true);
        setTimeout(checkIndexLimits, 400);
      });
      dotsContainer.appendChild(dot);
    }
  };

  const handleResize = () => {
    const itemsPerView = getItemsPerView();
    const containerWidth = container.getBoundingClientRect().width;
    const gap = itemsPerView === 1 ? 12 : 24;
    
    let itemWidth = 0;
    if (itemsPerView === 1) {
      itemWidth = containerWidth * 0.85;
    } else {
      itemWidth = (containerWidth - (gap * (itemsPerView - 1))) / itemsPerView;
    }

    track.style.width = 'max-content';

    allItems.forEach(item => {
      item.style.width = `${itemWidth}px`;
      item.style.marginRight = `${gap}px`;
      item.style.display = 'block';
    });

    rebuildDots();
    updateSlider(false);
  };

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isTransitioning) return;
      isTransitioning = true;
      currentIdx--;
      updateSlider(true);
      setTimeout(checkIndexLimits, 400);
    });

    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isTransitioning) return;
      isTransitioning = true;
      currentIdx++;
      updateSlider(true);
      setTimeout(checkIndexLimits, 400);
    });
  }

  setTimeout(handleResize, 100);

  return {
    refresh: () => {
      Array.from(track.querySelectorAll('.slider-clone')).forEach(clone => clone.remove());
      originalItems = Array.from(track.children);
      
      for (let i = 0; i < itemsPerViewMax; i++) {
        const cloneFirst = originalItems[i].cloneNode(true);
        cloneFirst.classList.add('slider-clone');
        track.appendChild(cloneFirst);
      }
      for (let i = originalItems.length - 1; i >= originalItems.length - itemsPerViewMax; i--) {
        const cloneLast = originalItems[i].cloneNode(true);
        cloneLast.classList.add('slider-clone');
        track.insertBefore(cloneLast, track.firstChild);
      }

      allItems = Array.from(track.children);
      currentIdx = itemsPerViewMax;
      handleResize();
    },
    handleResize: handleResize
  };
};

// Inicializa os sliders na Home
document.addEventListener('DOMContentLoaded', () => {
  let highlightsSlider = null;

  // ── Categorias: SEMPRE em modo grid (sem carrossel em qualquer tela) ──
  const initCategorySlider = () => {
    const track = document.getElementById('categorias-slider-track');
    const prevBtn = document.getElementById('btn-cat-prev');
    const nextBtn = document.getElementById('btn-cat-next');
    const dots = document.getElementById('categorias-slider-dots');

    if (track) {
      track.style.transform = '';
      track.classList.remove('premium-slider-track');
      Array.from(track.querySelectorAll('.slider-clone')).forEach(clone => clone.remove());
      Array.from(track.children).forEach(item => {
        item.style.width = '';
        item.style.marginRight = '';
        item.style.display = '';
      });
      track.style.width = '100%';
    }
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (dots) dots.style.display = 'none';
  };

  // Resize listener para o slider de destaques apenas
  const globalResizeHandler = () => {
    if (highlightsSlider) {
      highlightsSlider.handleResize();
    }
  };

  window.addEventListener('resize', globalResizeHandler);
  initCategorySlider();

  window.initHighlightsSlider = () => {
    if (!highlightsSlider) {
      highlightsSlider = setupGeneralSlider('destaques-slider-wrapper', 2, 4);
    } else {
      highlightsSlider.refresh();
    }
  };

  // refreshCategorySlider chamado pelo auth.js após carregar categorias do Firebase
  window.refreshCategorySlider = () => {
    initCategorySlider();
  };
});
