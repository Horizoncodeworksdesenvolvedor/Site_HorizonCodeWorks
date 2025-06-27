// Mobile Navigation
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling function
function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Video Player System
function playVideo(button, videoSrc) {
    const container = button.closest('.project-video-container');
    const thumbnail = container.querySelector('.project-video-thumbnail');
    const overlay = container.querySelector('.video-overlay');
    const video = container.querySelector('.project-video');
    
    // Se não há vídeo especificado, mostrar mensagem
    if (!videoSrc || videoSrc.trim() === '') {
        alert('Vídeo em breve! Este projeto ainda não possui demonstração em vídeo.');
        return;
    }
    
    // Configurar o vídeo
    const source = video.querySelector('source');
    source.src = videoSrc;
    video.load();
    
    // Esconder thumbnail e overlay
    thumbnail.style.display = 'none';
    overlay.style.display = 'none';
    
    // Mostrar vídeo
    video.style.display = 'block';
    container.classList.add('playing');
    
    // Adicionar botão de fechar
    if (!container.querySelector('.close-video-btn')) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-video-btn';
        closeBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
        closeBtn.onclick = () => closeVideo(container);
        container.appendChild(closeBtn);
    }
    
    // Reproduzir vídeo
    video.play().catch(error => {
        console.error('Erro ao reproduzir vídeo:', error);
        alert('Erro ao carregar o vídeo. Verifique se o arquivo existe.');
        closeVideo(container);
    });
    
    // Adicionar event listener para quando o vídeo terminar
    video.addEventListener('ended', () => {
        closeVideo(container);
    });
}

function closeVideo(container) {
    const thumbnail = container.querySelector('.project-video-thumbnail');
    const overlay = container.querySelector('.video-overlay');
    const video = container.querySelector('.project-video');
    const closeBtn = container.querySelector('.close-video-btn');
    
    // Parar vídeo
    video.pause();
    video.currentTime = 0;
    
    // Esconder vídeo
    video.style.display = 'none';
    container.classList.remove('playing');
    
    // Mostrar thumbnail e overlay
    thumbnail.style.display = 'block';
    overlay.style.display = 'flex';
    
    // Remover botão de fechar
    if (closeBtn) {
        closeBtn.remove();
    }
}

// Success Animation Management
const formContainer = document.getElementById('form-container');
const successAnimation = document.getElementById('success-animation');
const sendAgainBtn = document.getElementById('send-again-btn');
const backToTopBtn = document.getElementById('back-to-top-btn');
const contactForm = document.getElementById('contact-form');

function showSuccessAnimation() {
    formContainer.classList.add('hidden');
    successAnimation.classList.remove('hidden');
    setTimeout(() => {
        successAnimation.classList.add('show');
    }, 50);
}

function hideSuccessAnimation() {
    successAnimation.classList.remove('show');
    setTimeout(() => {
        successAnimation.classList.add('hidden');
        formContainer.classList.remove('hidden');
    }, 500);
}

// Success animation button handlers
sendAgainBtn.addEventListener('click', () => {
    hideSuccessAnimation();
    contactForm.reset();
    scrollToSection('contato');
});

backToTopBtn.addEventListener('click', () => {
    hideSuccessAnimation();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Contact form handling
contactForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
            <path d="M21,12a9,9,0,0,1-9,9c-2.52,0-4.93-1-6.74-2.74L5,18.26a7,7,0,0,0,7,1.74,7,7,0,0,0,7-7Z"/>
        </svg>
        Enviando...
    `;
    submitBtn.disabled = true;

    // Get form data
    const formData = {
        nome_do_remetente: document.getElementById("from_name").value,
        email_do_remetente: document.getElementById("from_email").value,
        assunto: document.getElementById("subject").value,
        mensagem: document.getElementById("message").value
    };

    // Check if EmailJS is available
    if (typeof emailjs !== 'undefined') {
        emailjs.send("service_wf4rnkl", "template_l9b1wya", formData)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                showSuccessAnimation();
                contactForm.reset();
            })
            .catch(function(error) {
                console.log('FAILED...', error);
                alert("Erro ao enviar mensagem. Tente novamente.");
            })
            .finally(function() {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
    } else {
        // Fallback if EmailJS is not loaded
        console.log('EmailJS not loaded, showing demo success');
        setTimeout(() => {
            showSuccessAnimation();
            contactForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.service-card, .project-card, .section-header').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
});

// Add CSS for spin animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);