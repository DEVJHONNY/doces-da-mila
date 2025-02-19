window.mostrarFeedback = function(mensagem, tipo = 'success') {
    Swal.fire({
        title: tipo === 'success' ? 'Sucesso!' : 'Atenção',
        text: mensagem,
        icon: tipo,
        timer: 2000,
        showConfirmButton: false
    });
};

window.confirmarAcao = async function(mensagem, tipo = 'warning') {
    const result = await Swal.fire({
        title: 'Confirmar',
        text: mensagem,
        icon: tipo,
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Cancelar'
    });
    return result.isConfirmed;
};
