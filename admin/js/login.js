// Verificar se já está logado
if (sessionStorage.getItem('adminLogado')) {
    window.location.href = 'index.html';
}

const CREDENCIAIS = {
    usuario: 'admin',
    senha: 'miladoces2024' // Você pode alterar para a senha que desejar
};

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    const errorMessage = document.getElementById('error-message');

    if (usuario === CREDENCIAIS.usuario && senha === CREDENCIAIS.senha) {
        // Salvar sessão
        sessionStorage.setItem('adminLogado', 'true');
        // Redirecionar para o dashboard
        window.location.href = 'index.html';
    } else {
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Usuário ou senha incorretos';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }
});
