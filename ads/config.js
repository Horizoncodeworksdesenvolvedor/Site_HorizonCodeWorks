// ===== ADVERTISEMENT CONFIGURATION =====
// Add your advertisements here. The system supports both images and videos.

const advertisementConfig = {
    // Display settings
    displayTime: 15000, // Time each ad shows (milliseconds)
    autoStart: true,   // Auto-show ads when page loads
    randomStart: true, // Start with random ad instead of first one
    
    // Advertisement list
    ads: [
        {
            type: 'image',
            src: 'ads/img/Public pai.png', // Put your image in ads/img/ folder
            title: 'Seu Anúncio Aqui',
            description: 'Descrição do seu produto ou serviço'
        },
        {
            type: 'image',
            src: 'ads/img/img_brastemp_concerto.png', // YouTube link or local video file
            title: 'Demonstração em Vídeo',
            description: 'Para vídeos, use links do YouTube ou arquivos locais MP4 em ads/videos/',
            link: 'https://www.youtube.com/watch?v=SVJ5IyZgFaU'
        },
        {
            type: 'image',
            src: 'ads/img/Public_Horizon.png',
            title: 'Desenvolvimento Web',
            description: 'Sites profissionais e modernos',
            link: 'https://www.instagram.com/horizoncodeworks/'
        }
    ]
};

// Export configuration (for modular use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = advertisementConfig;
}