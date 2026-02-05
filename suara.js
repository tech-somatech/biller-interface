// ==============================================
// DEFINISI FUNGSI (LETAKKAN DI ATAS!)
// ==============================================

// 🎨 DATA YANG AKAN DIKIRIM KE MODAL IFRAME
let modalData = {};

// 🔍 MEMBUKA MODAL FULLSCREEN DENGAN IFRAME
function expandToBodyArea(data = {}) {
    
    // Simpan data yang akan dikirim ke modal
    modalData = data;
    
    // Buat overlay gelap di belakang modal
    const overlay = document.createElement('div');
    overlay.id = 'modalOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0);
        z-index: 9999998;
        backdrop-filter: blur(0px);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    // Buat container modal
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modalContainer';
    modalContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.9);
        width: 95vw;
        height: 95vh;
        max-width: 1400px;
        max-height: 900px;
        background: white;
        border-radius: 24px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        z-index: 9999999;
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        display: flex;
        flex-direction: column;
    `;

    // ✅ Tombol close floating (tanpa header)
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    `;
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.6);
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        color: white;
        z-index: 10;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

    closeBtn.onmouseenter = () => {
        closeBtn.style.background = 'rgba(0, 0, 0, 0.8)';
        closeBtn.style.transform = 'rotate(90deg)';
    };
    closeBtn.onmouseleave = () => {
        closeBtn.style.background = 'rgba(0, 0, 0, 0.6)';
        closeBtn.style.transform = 'rotate(0deg)';
    };
    closeBtn.onclick = closeModal;

    // Buat iframe baru untuk modal
    const modalIframe = document.createElement('iframe');
    modalIframe.id = 'modalIframe';
    
    // ✅ CEK APAKAH ADA URL CHECKOUT
    if (data.url) {
        // Jika ada URL checkout, load ke URL tersebut
        modalIframe.src = data.url;
    } else {
        // Jika tidak ada URL, load halaman awal (untuk fill form biasa)
        const mainIframe = document.getElementById('myCompFrame');
        modalIframe.src = mainIframe.dataset.originalSrc || mainIframe.src;
    }
    
    modalIframe.allow = 'clipboard-read; clipboard-write';
    modalIframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        background: white;
        border-radius: 24px;
    `;

    // Kirim data ke iframe setelah load (untuk fill form biasa)
    modalIframe.onload = () => {
        // Hanya kirim fillFormData jika BUKAN checkout (tidak ada URL)
        if (!data.url && modalData.formData) {
            setTimeout(() => {
                modalIframe.contentWindow.postMessage({
                    action: 'fillFormData',
                    data: modalData
                }, '*');
            }, 500);
        }
    };

    // ✅ Susun modal (tanpa header, langsung iframe + close button)
    modalContainer.appendChild(modalIframe);
    modalContainer.appendChild(closeBtn);
    document.body.appendChild(overlay);
    document.body.appendChild(modalContainer);

    // Animasi masuk
    requestAnimationFrame(() => {
        setTimeout(() => {
            overlay.style.background = 'rgba(0, 0, 0, 0.6)';
            overlay.style.backdropFilter = 'blur(8px)';
            modalContainer.style.opacity = '1';
            modalContainer.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);
    });

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

// 🔙 TUTUP MODAL DAN KEMBALI KE TAMPILAN NORMAL
function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    const modalContainer = document.getElementById('modalContainer');

    if (modalContainer && overlay) {
        // Animasi keluar
        modalContainer.style.opacity = '0';
        modalContainer.style.transform = 'translate(-50%, -50%) scale(0.9)';
        overlay.style.background = 'rgba(0, 0, 0, 0)';
        overlay.style.backdropFilter = 'blur(0px)';

        setTimeout(() => {
            modalContainer.remove();
            overlay.remove();
            document.body.style.overflow = '';
        }, 400);
    }
}

// 🔄 UPDATE DATA DARI MODAL KE PARENT IFRAME
function updateParentData(data) {
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

window.addEventListener('message', function(event) {
    const action = event.data.action;

    const iframe = document.getElementById('myCompFrame');

    // 📏 Resize iframe
    if (action === 'resizeIframe' && event.data.height) {
        iframe.style.height = event.data.height + 'px';
    }

    // 🔍 Expand fullscreen dengan data
    if (action === 'expandToBody') {
        expandToBodyArea(event.data);
    }

    // 🔁 Redirect home
    if (action === 'redirectToHome') {
        window.location.href = window.location.origin;
    }

    // 💾 Update data dari modal ke parent
    if (action === 'updateParentForm') {
        updateParentData(event.data.data);
        closeModal();
    }

    // ❌ Close modal dari dalam iframe
    if (action === 'closeModal') {
        closeModal();
    }
});

// Tutup modal dengan ESC key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modalContainer = document.getElementById('modalContainer');
        if (modalContainer) {
            closeModal();
        }
    }
});

// Tutup modal dengan klik overlay
document.addEventListener('click', function(event) {
    const overlay = document.getElementById('modalOverlay');
    if (event.target === overlay) {
        closeModal();
    }
});