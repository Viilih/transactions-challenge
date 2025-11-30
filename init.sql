CREATE TABLE tipos_usuarios (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO tipos_usuarios (tipo) VALUES ('COMUM'), ('LOJISTA');

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  tipo_usuario_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (tipo_usuario_id) REFERENCES tipos_usuarios(id)
);

CREATE TABLE contas (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL,
  saldo DECIMAL(15,2) DEFAULT 0 NOT NULL CHECK (saldo >= 0),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE transacoes (
  id SERIAL PRIMARY KEY,
  pagador_id INTEGER NOT NULL,
  beneficiario_id INTEGER NOT NULL,
  valor DECIMAL(15,2) NOT NULL CHECK (valor > 0),
  status VARCHAR(20) DEFAULT 'PENDENTE',
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (pagador_id) REFERENCES usuarios(id),
  FOREIGN KEY (beneficiario_id) REFERENCES usuarios(id),
  CHECK (pagador_id != beneficiario_id)
);