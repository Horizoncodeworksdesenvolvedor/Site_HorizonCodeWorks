// ===== ADVERTISEMENT SYSTEM =====

// Advertisement configuration - Load from config file
let advertisements = [];
let currentAdIndex = 0;
let adTimer = null;
let adTimerInterval = null;
let isAdPlaying = false;
const AD_DISPLAY_TIME = 5000; // 5 seconds per ad

// Advertisement DOM elements
const adModal = document.getElementById('ad-modal');
const adContent = document.getElementById('ad-content');
const adCloseBtn = document.getElementById('ad-close-btn');
const adPrevBtn = document.getElementById('ad-prev-btn');
const adNextBtn = document.getElementById('ad-next-btn');
const adCurrent = document.getElementById('ad-current');
const adTotal = document.getElementById('ad-total');
const adTimerText = document.getElementById('timer-text');
const timerProgress = document.getElementById('timer-progress');

// Load advertisement configuration
function loadAdvertisementConfig() {
    // Try to load from ads/config.js
    if (typeof advertisementConfig !== 'undefined' && advertisementConfig.ads) {
        advertisements = advertisementConfig.ads;
        return true;
    }
    
    // Fallback configuration if config file is not loaded
    advertisements = [
        {
            type: 'image',
            src: 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=800',
            title: 'Desenvolvimento Web Profissional',
            description: 'Criamos sites modernos e responsivos para o seu negócio'
        },
        {
            type: 'image', 
            src: 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=800',
            title: 'Aplicações Mobile',
            description: 'Apps nativos e híbridos para iOS e Android'
        },
        {
            type: 'video',
            src: 'vds/Sistema_de_controle_de_Estoque.mp4',
            title: 'Sistema de Controle de Estoque',
            description: 'Veja como nosso sistema funciona na prática'
        }
    ];
    
    return false;
}

// Initialize advertisement system
function initAdvertisementSystem() {
    // Load configuration
    const configLoaded = loadAdvertisementConfig();
    
    if (advertisements.length === 0) {
        console.log('Nenhum anúncio configurado');
        return;
    }
    
    // Set total ads count
    adTotal.textContent = advertisements.length;
    
    // Check if should auto-start and use random start
    const shouldAutoStart = typeof advertisementConfig !== 'undefined' ? 
        advertisementConfig.autoStart : true;
    const shouldRandomStart = typeof advertisementConfig !== 'undefined' ? 
        advertisementConfig.randomStart : true;
    
    if (!shouldAutoStart) return;
    
    // Get starting ad index
    if (shouldRandomStart) {
        currentAdIndex = Math.floor(Math.random() * advertisements.length);
    } else {
        currentAdIndex = 0;
    }
    
    // Show the advertisement modal after a brief delay
    setTimeout(() => {
        showAdvertisementModal();
    }, 1000);
    
    // Bind event listeners
    bindAdvertisementEvents();
}

// Show advertisement modal
function showAdvertisementModal() {
    if (advertisements.length === 0) return;
    
    loadCurrentAd();
    adModal.classList.add('show');
    isAdPlaying = true;
    startAdTimer();
}

// Hide advertisement modal
function hideAdvertisementModal() {
    adModal.classList.remove('show');
    isAdPlaying = false;
    stopAdTimer();
    pauseAllVideos();
}

// Load current advertisement
function loadCurrentAd() {
    const ad = advertisements[currentAdIndex];
    if (!ad) return;
    
    // Update counter
    adCurrent.textContent = currentAdIndex + 1;
    
    // Clear current content
    adContent.innerHTML = '';
    
    // Create loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'ad-loading';
    loadingDiv.innerHTML = `
        <div class="ad-loading-spinner"></div>
        <div>Carregando anúncio...</div>
    `;
    adContent.appendChild(loadingDiv);
    
    // Create ad item container
    const adItem = document.createElement('div');
    adItem.className = 'ad-item active';
    
    if (ad.type === 'image') {
        loadImageAd(adItem, ad, loadingDiv);
    } else if (ad.type === 'video') {
        loadVideoAd(adItem, ad, loadingDiv);
    }
}

// Load image advertisement
function loadImageAd(container, ad, loadingDiv) {
    const img = document.createElement('img');
    img.className = 'ad-image';
    img.alt = ad.title || 'Anúncio';
    
    img.onload = () => {
        loadingDiv.remove();
        container.appendChild(img);
        adContent.appendChild(container);
        
        // Add click handler if link is provided
        if (ad.link) {
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => {
                if (ad.link.startsWith('#')) {
                    hideAdvertisementModal();
                    scrollToSection(ad.link.substring(1));
                } else {
                    window.open(ad.link, '_blank');
                }
            });
        }
    };
    
    img.onerror = () => {
        showAdPlaceholder(container, loadingDiv, 'Erro ao carregar imagem: ' + ad.src);
    };
    
    img.src = ad.src;
}

// Extract YouTube video ID from URL
function getYouTubeVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Check if URL is a YouTube link
function isYouTubeUrl(url) {
    return url.includes('youtube.com') || url.includes('youtu.be');
}

// Load video advertisement (supports both local files and YouTube)
function loadVideoAd(container, ad, loadingDiv) {
    if (isYouTubeUrl(ad.src)) {
        // Handle YouTube video
        const videoId = getYouTubeVideoId(ad.src);
        if (!videoId) {
            showAdPlaceholder(container, loadingDiv, 'Link do YouTube inválido: ' + ad.src);
            return;
        }
        
        // Create YouTube iframe
        const iframe = document.createElement('iframe');
        iframe.className = 'ad-video';
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`;
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        
        iframe.onload = () => {
            loadingDiv.remove();
            container.appendChild(iframe);
            adContent.appendChild(container);
        };
        
        iframe.onerror = () => {
            showAdPlaceholder(container, loadingDiv, 'Erro ao carregar vídeo do YouTube: ' + ad.src);
        };
        
    } else {
        // Handle local video file
        const video = document.createElement('video');
        video.className = 'ad-video';
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.controls = true;
        
        const source = document.createElement('source');
        source.src = ad.src;
        source.type = 'video/mp4';
        
        video.appendChild(source);
        
        video.onloadeddata = () => {
            loadingDiv.remove();
            container.appendChild(video);
            adContent.appendChild(container);
            
            // Auto-play video
            video.play().catch(e => {
                console.log('Auto-play prevented:', e);
            });
        };
        
        video.onerror = () => {
            showAdPlaceholder(container, loadingDiv, 'Vídeo não encontrado: ' + ad.src);
        };
    }
}

// Show placeholder when content fails to load
function showAdPlaceholder(container, loadingDiv, message) {
    loadingDiv.remove();
    
    container.innerHTML = `
        <div class="ad-placeholder">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21,15 16,10 5,21"></polyline>
            </svg>
            <h3>Conteúdo indisponível</h3>
            <p>${message}</p>
        </div>
    `;
    
    adContent.appendChild(container);
}

// Navigate to previous ad
function showPreviousAd() {
    stopAdTimer();
    currentAdIndex = (currentAdIndex - 1 + advertisements.length) % advertisements.length;
    loadCurrentAd();
    startAdTimer();
}

// Navigate to next ad
function showNextAd() {
    stopAdTimer();
    currentAdIndex = (currentAdIndex + 1) % advertisements.length;
    loadCurrentAd();
    startAdTimer();
}

// Start ad timer with visual countdown
function startAdTimer() {
    // Get display time from config or use default
    const displayTime = typeof advertisementConfig !== 'undefined' ? 
        advertisementConfig.displayTime : AD_DISPLAY_TIME;
    
    let timeLeft = displayTime / 1000; // Convert to seconds
    adTimerText.textContent = timeLeft;
    
    // Reset progress circle
    const circumference = 2 * Math.PI * 10; // radius = 10
    timerProgress.style.strokeDasharray = circumference;
    timerProgress.style.strokeDashoffset = 0;
    
    adTimerInterval = setInterval(() => {
        timeLeft--;
        adTimerText.textContent = timeLeft;
        
        // Update progress circle
        const progress = (displayTime / 1000 - timeLeft) / (displayTime / 1000);
        const offset = circumference * progress;
        timerProgress.style.strokeDashoffset = offset;
        
        if (timeLeft <= 0) {
            if (advertisements.length > 1) {
                showNextAd();
            } else {
                hideAdvertisementModal();
            }
        }
    }, 1000);
}

// Stop ad timer
function stopAdTimer() {
    if (adTimerInterval) {
        clearInterval(adTimerInterval);
        adTimerInterval = null;
    }
}

// Pause all videos in the advertisement
function pauseAllVideos() {
    const videos = adContent.querySelectorAll('video');
    videos.forEach(video => {
        video.pause();
    });
}

// Bind advertisement event listeners
function bindAdvertisementEvents() {
    // Close button
    adCloseBtn.addEventListener('click', hideAdvertisementModal);
    
    // Navigation buttons
    adPrevBtn.addEventListener('click', showPreviousAd);
    adNextBtn.addEventListener('click', showNextAd);
    
    // Close on background click
    adModal.addEventListener('click', (e) => {
        if (e.target === adModal) {
            hideAdvertisementModal();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!isAdPlaying) return;
        
        switch(e.key) {
            case 'Escape':
                hideAdvertisementModal();
                break;
            case 'ArrowLeft':
                showPreviousAd();
                break;
            case 'ArrowRight':
                showNextAd();
                break;
        }
    });
    
    // Update navigation buttons state
    function updateNavigationButtons() {
        adPrevBtn.disabled = advertisements.length <= 1;
        adNextBtn.disabled = advertisements.length <= 1;
    }
    
    updateNavigationButtons();
}

// ===== EXISTING WEBSITE FUNCTIONALITY =====

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

// Video Player System for Projects
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
    
    // Initialize advertisement system
    initAdvertisementSystem();
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
