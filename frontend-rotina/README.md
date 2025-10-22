# Routine and Performance App

Este repositório contém um sistema web simples para acompanhar atividades semanais, dietas, anotações de treino e metas. O backend foi construído em **Node.js** com **Express** e utiliza **PostgreSQL** para persistência; o frontend é um esqueleto em **Angular** pensado para ser facilmente customizado. Não há autenticação: o sistema foi concebido para uso pessoal e roda em um único usuário.

## Como rodar o backend

1. Instale as dependências do backend:

   ```bash
   cd routine-app/backend
   npm install
   mvn clean spring-boot:run

   ```

   > Obs.: você precisará ter o Node.js e o gerenciador de pacotes `npm` instalados. O pacote `pg` depende de um servidor PostgreSQL rodando e acessível.

2. Configure as variáveis de ambiente com os dados de conexão do PostgreSQL. Por padrão, o `server.js` tenta conectar em `localhost` na porta `5432` usando o usuário `postgres` e a base `routine_app`. Você pode definir as variáveis `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` e `PGPORT` para adequar à sua instalação.

3. Crie a base e execute as migrações presentes em `backend/sql/create_tables.sql`. Por exemplo:

   ```bash
   createdb routine_app
   psql -d routine_app -f sql/create_tables.sql
   ```

4. Inicie o servidor:

   ```bash
   npm start
   ```

   O backend ficará escutando na porta `3000` por padrão (configurável via `PORT`).

## Como rodar o frontend

O frontend é um esqueleto Angular. Para utilizá‑lo, você precisa ter o `@angular/cli` instalado globalmente (`npm install -g @angular/cli`) e acesso à internet para baixar as dependências. Após a instalação do CLI:

1. Instale as dependências do frontend:

   ```bash
   cd routine-app/frontend
   npm install
   ```

2. Para rodar em ambiente de desenvolvimento:

   ```bash
   npm start
   ```

   O comando `ng serve` definido em `package.json` abrirá a aplicação em `http://localhost:4200`. O proxy de chamadas para o backend pode ser configurado no arquivo `proxy.conf.json` (não fornecido) ou alterando as URLs nos serviços. Atualmente, os serviços usam caminhos relativos (`/api/…`), portanto, se o frontend e o backend rodarem no mesmo host, as requisições funcionarão sem proxy.

## Estrutura de diretórios

```
routine-app/
├── backend/          # Código do backend (Express)
│   ├── package.json  # Dependências e scripts
│   ├── server.js     # Servidor Express e API
│   └── sql/
│       └── create_tables.sql  # Script SQL para criação das tabelas
└── frontend/         # Código do frontend (Angular)
    ├── package.json  # Dependências e scripts para Angular
    ├── tsconfig.json # Configuração do TypeScript
    └── src/
        ├── main.ts   # Ponto de entrada Angular
        └── app/
            ├── app.module.ts     # Módulo principal
            ├── app.component.ts  # Componente raiz
            ├── app.component.html
            └── ...               # Demais componentes (calendar, diet, training, goals)
```

## Próximos passos e melhorias

Este projeto foi construído para servir de base. Algumas ideias para evoluí‑lo:

* Adicionar autenticação para múltiplos usuários.
* Implementar edição e remoção de registros.
* Melhorar a interface com design responsivo e feedbacks visuais.
* Implementar armazenamento de arquivos (por exemplo, anexar fotos de refeições ou treinos).
* Criar testes automatizados para o backend e para o frontend.
* Proximos passos ROTINA, DIARIO e FINANÇAS
