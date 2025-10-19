import { z } from 'zod';

// Variables globales que se reinicializarán
let successAdvice;
let contactForm;
let steps;
let progress;
let submitButton;
let currentStep = 0;
let cleanupFunctions = [];

const schema = z.object({
  name: z.string().min(1, 'Este campo no puede estar vacío'),
  email: z.email('Correo no valido'),
  message: z.string().min(1, 'Este campo no puede estar vacío'),
});

function showStep(index) {
  steps.forEach((step, i) => {
    step.classList.toggle('hidden', i !== index);
    step.classList.toggle('active', i === index);
  });

  // Hacer focus en el input del paso actual
  const currentInput = steps[index].querySelector(
    'input[type="text"], input[type="email"]',
  );
  if (currentInput) {
    // Pequeño delay para asegurar que la animación termine
    setTimeout(() => currentInput.focus(), 100);
  }
}

function disabledFormButton(button) {
  button.setAttribute('disabled', 'true');
  button.classList.add('disabled');
}

function enableFormButton(button) {
  button.removeAttribute('disabled');
  button.classList.remove('disabled');
}

function validateStep(index) {
  const fieldNames = ['name', 'email', 'message'];

  const field = document.querySelector(`#${fieldNames[index]}`)?.value;
  const input = fieldNames[index];

  const result = schema.pick({ [input]: true }).safeParse({ [input]: field });

  if (!result.success) {
    const firstError = result.error.issues[0]?.message;
    return { success: false, error: firstError };
  }
  return { success: true, error: null };
}

function createErrorSpan(error) {
  const span = document.createElement('span');
  span.classList.add(
    'text-carnation',
    'mt-2',
    'font-general-sans',
    'text-[15px]',
  );
  span.textContent = error;
  return span;
}

function animateProgressBar(to, duration = 300) {
  const start = progress.value;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progressValue = start + (to - start) * (elapsed / duration);

    progress.value =
      to > start ? Math.min(progressValue, to) : Math.max(progressValue, to);

    if (elapsed < duration) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function updateProgressBar(currentStep) {
  const target = currentStep * (100 / steps.length);
  animateProgressBar(target);
}

function handleNext(button) {
  disabledFormButton(button);
  if (currentStep < steps.length - 1) {
    const inputContainer = steps[currentStep].querySelector('.input-container');
    inputContainer?.querySelector('span')?.remove();

    setTimeout(() => {
      const validation = validateStep(currentStep);

      if (!validation.success) {
        const span = createErrorSpan(validation.error);
        inputContainer?.append(span);
        enableFormButton(button);
        return;
      }

      currentStep++;
      showStep(currentStep);
      enableFormButton(button);
      updateProgressBar(currentStep);
    }, 300);
  }
}

function handlePrev() {
  if (currentStep > 0) {
    currentStep--;
    showStep(currentStep);
    updateProgressBar(currentStep);
  }
}

function handleEnterKey(e) {
  // Si se presiona Enter
  if (e.key === 'Enter') {
    e.preventDefault(); // Previene el submit por defecto

    // Si estamos en el último paso, enviar el formulario
    if (currentStep === steps.length - 1) {
      contactForm.requestSubmit();
    } else {
      // Si no, avanzar al siguiente paso
      const nextButton = steps[currentStep].querySelector('.next');
      if (nextButton) {
        nextButton.click();
      }
    }
  }
}

function handleSubmit(e) {
  e.preventDefault();
  const inputContainer = steps[currentStep].querySelector('.input-container');

  disabledFormButton(submitButton);
  inputContainer?.querySelector('span')?.remove();

  setTimeout(() => {
    const validation = validateStep(currentStep);

    if (!validation.success) {
      const span = createErrorSpan(validation.error);
      inputContainer?.append(span);
      enableFormButton(submitButton);
      return;
    }

    currentStep++;
    // enableFormButton(submitButton);
    updateProgressBar(currentStep);
    // Aquí puedes procesar el envío del formulario
    contactForm.submit();

    // showStep(currentStep);
    // contactForm.classList.add('hidden');
    // successAdvice.classList.remove('hidden');
  }, 300);
}

function cleanup() {
  // Limpia todos los event listeners
  cleanupFunctions.forEach((fn) => fn());
  cleanupFunctions = [];
}

function initContactForm() {
  // Limpia cualquier listener anterior
  cleanup();

  // Reinicia las variables
  currentStep = 0;
  contactForm = document.querySelector('#contact-form');
  steps = document.querySelectorAll('.step');
  progress = document.querySelector('#progress');
  submitButton = document.querySelector('#submit-btn');
  successAdvice = document.querySelector('#success-advise');

  // Si no encontramos el formulario, no hacemos nada
  if (!contactForm) {
    return;
  }

  // Configurar event listeners con referencias para poder limpiarlos
  document.querySelectorAll('.next').forEach((btn) => {
    const handler = () => handleNext(btn);
    btn.addEventListener('click', handler);
    cleanupFunctions.push(() => btn.removeEventListener('click', handler));
  });

  document.querySelectorAll('.prev').forEach((btn) => {
    const handler = () => handlePrev();
    btn.addEventListener('click', handler);
    cleanupFunctions.push(() => btn.removeEventListener('click', handler));
  });

  if (submitButton) {
    const handler = (e) => handleSubmit(e);
    contactForm.addEventListener('submit', handler);
    cleanupFunctions.push(() =>
      contactForm.removeEventListener('submit', handler),
    );

    const clickHandler = () => contactForm?.requestSubmit();
    submitButton.addEventListener('click', clickHandler);
    cleanupFunctions.push(() =>
      submitButton.removeEventListener('click', clickHandler),
    );
  }

  // Agregar listener para la tecla Enter en todos los inputs
  const inputs = contactForm.querySelectorAll(
    'input[type="text"], input[type="email"]',
  );
  inputs.forEach((input) => {
    const enterHandler = (e) => handleEnterKey(e);
    input.addEventListener('keydown', enterHandler);
    cleanupFunctions.push(() =>
      input.removeEventListener('keydown', enterHandler),
    );
  });

  // Muestra el primer paso
  showStep(currentStep);
}

// Inicializar cuando la página se carga por primera vez
document.addEventListener('astro:page-load', initContactForm);

// Reinicializar después de cada navegación
document.addEventListener('astro:after-swap', initContactForm);

// Limpiar antes de navegar a otra página
document.addEventListener('astro:before-swap', cleanup);
