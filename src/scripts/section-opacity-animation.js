import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText, ScrollTrigger);

function initAnimations() {
  // Animacion de opacidad por secciones
  const sections = document.querySelectorAll('.section');

  sections.forEach((section) => {
    const elements = section.querySelectorAll('.anim-element');
    gsap.from(elements, {
      scrollTrigger: {
        trigger: section,
        start: 'top 60%',
        toggleActions: 'play none none none',
      },
      duration: 0.6,
      autoAlpha: 0,
      stagger: 0.5,
    });
  });

  // Animacion de despliegue de titulos
  const sectionTitles = document.querySelectorAll('.anim-title');

  sectionTitles.forEach((title) => {
    const text = new SplitText(title, { type: 'chars', smartWrap: true });

    gsap.from(text.chars, {
      scrollTrigger: {
        trigger: title,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      duration: 0.4,
      autoAlpha: 0,
      y: 50,
      x: -10,
      stagger: 0.04,
    });
  });
}

// correr la primera vez
initAnimations();

// correr después de cada viewTransition
document.addEventListener('astro:after-swap', () => {
  ScrollTrigger.getAll().forEach((st) => st.kill()); // limpiar triggers viejos
  initAnimations();
});
