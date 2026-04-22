// ==============================================
// DEFINISI FUNGSI (LETAKKAN DI ATAS!)
// ==============================================

// 💾 STATE MANAGEMENT
let isModalOpen = false;
let originalMainIframeSrc = null;

// 🔧 GET BASE URL FROM IFRAME
function getBaseURL() {
    const mainIframe = document.getElementById('myCompFrame');
    if (mainIframe && mainIframe.src) {
        try {
            const url = new URL(mainIframe.src);
            return url.origin;
        } catch (e) {
            return window.location.origin; // Fallback to current page origin
        }
    }
    return window.location.origin; // Fallback
}

// 🎨 OPEN MODAL FULLSCREEN
function openModal(data = {}) {
    
    const overlay = document.getElementById('modalOverlay');
    const container = document.getElementById('modalContainer');
    const modalIframe = document.getElementById('modalIframe');
    const mainIframe = document.getElementById('myCompFrame');
    
    if (!overlay || !container || !modalIframe) {
        return;
    }
    
    // 💾 Simpan URL awal main iframe (hanya sekali)
    if (!originalMainIframeSrc && mainIframe) {
        originalMainIframeSrc = mainIframe.src;
    }
    
    // ✅ Set URL untuk modal iframe
    if (data.url) {
        modalIframe.src = data.url;
    } else {
        // Default ke halaman checkout menggunakan base URL dari main iframe
        const baseURL = getBaseURL();
        modalIframe.src = baseURL + '/checkout/';
    }
    
    // 🎨 Show overlay dan container dengan animasi
    overlay.classList.add('active');
    container.classList.add('active');
    
    // 🚫 Prevent body scroll
    document.body.classList.add('modal-active');
    
    // ✅ Set flag
    isModalOpen = true;
}

// 🔙 CLOSE MODAL
function closeModal() {
    
    const overlay = document.getElementById('modalOverlay');
    const container = document.getElementById('modalContainer');
    const modalIframe = document.getElementById('modalIframe');
    const mainIframe = document.getElementById('myCompFrame');
    
    if (!overlay || !container || !modalIframe) {
        return;
    }
    
    // 🎨 Hide dengan animasi
    overlay.classList.remove('active');
    container.classList.remove('active');
    
    // ✅ Allow body scroll
    document.body.classList.remove('modal-active');
    
    // 🔄 Reload main iframe ke homepage setelah modal ditutup
    setTimeout(() => {
        // Clear modal iframe
        modalIframe.src = 'about:blank';
        
        // Reload main iframe ke homepage
        if (originalMainIframeSrc && mainIframe) {
            mainIframe.src = originalMainIframeSrc;
        } else if (mainIframe) {
            // Fallback: reload ke base URL + /
            const baseURL = getBaseURL();
            mainIframe.src = baseURL + '/';
        }
        
        // Reset flag
        isModalOpen = false;
    }, 300); // Match CSS transition duration
}

// 🔄 UPDATE DATA DARI MODAL KE MAIN IFRAME
function updateMainIframeData(data) {
    const mainIframe = document.getElementById('myCompFrame');
    if (mainIframe && mainIframe.contentWindow) {
        mainIframe.contentWindow.postMessage({
            action: 'updateFormData',
            data: data
        }, '*');
    }
}

// ==============================================
// EVENT LISTENER (LETAKKAN DI BAWAH!)
// ==============================================

// ✅ HANDLER FUNCTION - Define once, reuse
function handlePostMessage(event) {
    if (!event.data || typeof event.data !== 'object') {
        return;
    }

    const action = event.data.action;
    const mainIframe = document.getElementById('myCompFrame');

    if (action === 'expandToBody' || action === 'openCheckout' || action === 'openModal') {
        openModal(event.data);
    }

    if (action === 'redirectToHome') {
        window.location.href = window.location.origin;
    }

    if (action === 'updateParentForm') {
        updateMainIframeData(event.data.data);
        closeModal();
    }

    if (action === 'closeModal') {
        closeModal();
    }

    // ✅ Tambahan: scroll lock saat iframe punya modal aktif
    if (action === 'iframeModalOpen') {
        document.body.style.overflow = 'hidden';
    }

    if (action === 'iframeModalClose') {
        document.body.style.overflow = '';
    }
}

// 🔒 FLAG untuk mencegah multiple event listener
let eventListenersInitialized = false;

// ✅ INITIALIZE EVENT LISTENERS - ONLY ONCE
function initializeEventListeners() {
    if (eventListenersInitialized) {
        return;
    }

    // 📨 Message listener
    window.addEventListener('message', handlePostMessage);

    // ❌ Close button click
    const closeBtn = document.getElementById('modalCloseBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // 🎨 Close modal when clicking overlay
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }

    // ⌨️ ESC key listener - close modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && isModalOpen) {
            closeModal();
        }
    });

    eventListenersInitialized = true;
}

function setupIframeAutoResize() {
    const mainIframe = document.getElementById('myCompFrame');
    if (!mainIframe) return;

    // Method 1: Listen to postMessage dari iframe content
    // window.addEventListener('message', function(event) {
    //     if (event.data.action === 'resizeIframe' && event.data.height) {
    //         mainIframe.style.height = event.data.height + 'px';
    //     }
    // });

    // Method 2: Auto-detect iframe content height
    // mainIframe.addEventListener('load', function() {
    //     try {
    //         // Try to access iframe content (hanya works jika same-origin)
    //         const iframeBody = mainIframe.contentDocument?.body;
    //         const iframeHtml = mainIframe.contentDocument?.documentElement;
            
    //         if (iframeBody && iframeHtml) {
    //             const height = Math.max(
    //                 iframeBody.scrollHeight,
    //                 iframeBody.offsetHeight,
    //                 iframeHtml.clientHeight,
    //                 iframeHtml.scrollHeight,
    //                 iframeHtml.offsetHeight
    //             );
                
    //             if (height > 0) {
    //                 mainIframe.style.height = height + 'px';
    //             }
    //         }
    //     } catch (e) {
    //         // Cross-origin, gunakan postMessage method
    //         console.log('Cannot access iframe content (cross-origin), using postMessage method');
    //     }
    // });
}

document.addEventListener('DOMContentLoaded', setupIframeAutoResize);

// ✅ INITIALIZE ON DOM READY
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEventListeners);
} else {
    initializeEventListeners();
}

// ✅ Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (isModalOpen) {
        closeModal();
    }
});