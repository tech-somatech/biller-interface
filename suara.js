// ==============================================
// MENANGANI KOMUNIKASI DARI IFRAME (postMessage)
// ==============================================

window.addEventListener('message', function(event) {
    // 🔒 Validasi asal pesan demi keamanan
    // Pastikan hanya menerima pesan dari domain yang dipercaya
    if (event.origin !== "https://biller-interface-dev.2secure.co.id") return;

    // Ambil nilai 'action' dari pesan yang dikirim
    const action = event.data.action;

    // Ambil elemen iframe dengan ID tertentu (pastikan ID-nya konsisten di HTML)
    const iframe = document.getElementById('myCompFrame');

    // 📏 Aksi: Menyesuaikan tinggi iframe berdasarkan konten internalnya
    if (action === 'resizeIframe' && event.data.height) {
        iframe.style.height = event.data.height + 'px';
    }

    // 🔍 Aksi: Memperluas iframe agar tampil fullscreen memenuhi seluruh layar
    if (action === 'expandToBody') {
        // Panggil fungsi khusus untuk handle expand fullscreen (jika tersedia)
        expandToBodyArea?.();
    }

    // 🔁 Aksi: Redirect halaman induk kembali ke "halaman utama" / asal
    if (action === 'redirectToHome') {
        // Ambil URL asal dari halaman embed (bukan iframe)
        const homeUrl = event.target.location.href;

        // Arahkan browser ke halaman tersebut
        window.location.href = homeUrl;
    }
});

// ==============================================
// MEMPERLUAS IFRAME KE LAYAR PENUH (FULLSCREEN)
// ==============================================

function expandToBodyArea() {
    const iframe = document.getElementById('myCompFrame');

    // 💾 Simpan style asli iframe agar bisa dikembalikan nanti
    if (!iframe.dataset.originalStyle) {
        iframe.dataset.originalStyle = iframe.style.cssText;
    }

    // 💾 Simpan URL asli iframe juga jika nanti ingin di-restore
    if (!iframe.dataset.originalSrc) {
        iframe.dataset.originalSrc = iframe.src;
    }

    // 🧹 Bersihkan margin, padding, dan scroll halaman
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';

    // 🎬 Jalankan animasi frame untuk merubah style iframe ke fullscreen
    requestAnimationFrame(() => {
        iframe.style.cssText = `
            position: fixed !important;       /* Tetap di tempat saat scroll */
            top: 0 !important;                /* Mulai dari atas layar */
            left: 0 !important;               /* Mulai dari kiri layar */
            width: 100vw !important;          /* Lebar layar penuh */
            height: 100vh !important;         /* Tinggi layar penuh */
            z-index: 9999 !important;         /* Di atas semua elemen */
            background-color: white !important;
            box-shadow: 0 0 20px rgba(0,0,0,0.5) !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
        `;

        // Tambahkan tombol kembali setelah iframe fullscreen
        addCloseButton();
    });
}

// ==============================================
// TOMBOL UNTUK KEMBALI DARI MODE FULLSCREEN
// ==============================================

function addCloseButton() {
    // Hindari membuat tombol lebih dari satu
    if (document.getElementById('closeBodyBtn')) return;

    // Buat tombol baru
    const closeBtn = document.createElement('button');
    closeBtn.id = 'closeBodyBtn';
    closeBtn.innerHTML = '← Kembali';

    // 💅 Styling tombol kembali agar tampil di pojok kanan atas layar
    closeBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000; /* Lebih tinggi dari iframe */
        background: #1f2937; /* Tailwind gray-800 */
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 9999px; /* Tombol oval */
        cursor: pointer;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        transition: background 0.3s ease;
    `;

    // 🖱️ Hover effect: ganti warna saat mouse diarahkan
    closeBtn.onmouseenter = () => closeBtn.style.background = '#374151'; // Tailwind gray-700
    closeBtn.onmouseleave = () => closeBtn.style.background = '#1f2937'; // Tailwind gray-800

    // 🔙 Klik tombol untuk memulihkan tampilan asli
    closeBtn.onclick = restoreOriginalView;

    // Tambahkan tombol ke dalam halaman
    document.body.appendChild(closeBtn);
}

// ==============================================
// KEMBALIKAN TAMPILAN IFRAME SEPERTI SEMULA
// ==============================================

function restoreOriginalView() {
    const iframe = document.getElementById('myCompFrame');

    // 🧼 Kembalikan style yang sebelumnya disimpan
    if (iframe && iframe.dataset.originalStyle) {
        iframe.style.cssText = iframe.dataset.originalStyle;
    }

    // 🔁 Reset URL iframe ke semula (jika perlu)
    iframe.src = iframe.dataset.originalSrc || iframe.src;

    // 🗑️ Hapus tombol kembali dari halaman
    const closeBtn = document.getElementById('closeBodyBtn');
    if (closeBtn) closeBtn.remove();
}
