function showLoading() {
    const loading = document.createElement('div');
    loading.className = 'loading-overlay fade-in';
    loading.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Carregando...</p>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.querySelector('.loading-overlay');
    if (loading) {
        loading.classList.add('fade-out');
        setTimeout(() => loading.remove(), 300);
    }
}

// Adicionar CSS necessário
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255,255,255,0.9);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        }

        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .fade-out {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
    </style>
`);

// Exportar funções globalmente
window.showLoading = showLoading;
window.hideLoading = hideLoading;
