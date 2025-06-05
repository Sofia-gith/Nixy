const uploadArquivo = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ erro: "Nenhum arquivo enviado." });
  }

  res.status(200).json({
    mensagem: "Arquivo enviado com sucesso!",
    arquivo: req.file.filename,
  });
};

export default { uploadArquivo };
