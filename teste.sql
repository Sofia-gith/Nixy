CREATE TABLE USUARIO_T01 (

ID_USUARIO_T01 INT PRIMARY KEY IDENTITY,  -- ID único para cada usuário

NOME_USUARIO_T01 VARCHAR(100) NOT NULL,   -- Nome completo do usuário

EMAIL_USUARIO_T01 VARCHAR(150) UNIQUE NOT NULL,  -- E-mail único do usuário

SENHA_USUARIO_T01 VARCHAR(255) NOT NULL,   -- Senha criptografada do usuário

DATACADASTRO_USUARIO_T01 DATETIME DEFAULT GETDATE(),  -- Data de cadastro (automático)

DATAEXCLUSAO_USUARIO_T01 DATETIME, -- Data de exclusão do usuário (soft delete)

CONSTRAINT CHK_EMAIL_FORMAT CHECK (EMAIL_USUARIO_T01 LIKE '%@%._%'), -- Validação de formato de e-mail

CONSTRAINT CHK_SENHA_LENGTH CHECK (LEN(SENHA_USUARIO_T01) >= 8) -- Validação de comprimento da senha

);