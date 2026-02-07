export const restoreBodyScroll = () => {
    if (typeof window === 'undefined') return;

    // Restore html and body overflow
    document.documentElement.style.overflow = '';
    document.documentElement.style.height = '';
    document.body.style.overflow = '';
    document.body.style.height = '';

    // Remove any scroll-restricting classes
    document.body.classList.remove('message-route');

    // Force reflow
    document.body.offsetHeight;

    // console.log('📜 Scroll restored for body');
};
