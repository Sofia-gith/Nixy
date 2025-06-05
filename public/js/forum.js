document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("formPostagemForm");
    const botaoAdd = document.querySelector(".botao-add");
    const botaoFechar = document.querySelector(".close");

   
    if (botaoAdd) {
        botaoAdd.addEventListener("click", mostrarFormulario);
    }

    
    if (botaoFechar) {
        botaoFechar.addEventListener("click", fecharFormulario);
    }

   
    if (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const formData = new FormData(form);

            try {
                const response = await fetch("/postagens", {
                    method: "POST",
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    alert("Postagem criada com sucesso!");
                    fecharFormulario();
                    window.location.reload();
                } else {
                    alert("Erro ao criar postagem: " + result.erro);
                }
            } catch (error) {
                console.error("Erro:", error);
                alert("Erro ao enviar a requisição.");
            }
        });
    }
});

function mostrarFormulario() {
    const modal = document.getElementById("formPostagem");
    if (modal) {
        modal.style.display = "block";
    }

    document.getElementById("tituloPostagem").value = "";
    document.getElementById("conteudoPostagem").value = "";
    document.getElementById("categoriaPostagem").value = "";
}


function fecharFormulario() {
    const modal = document.getElementById("formPostagem");
    if (modal) {
        modal.style.display = "none";
    }
}
