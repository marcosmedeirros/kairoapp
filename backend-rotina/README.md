# Routine and Performance App – Spring Boot

Esta pasta contém um backend alternativo em **Java/Spring Boot** que implementa as mesmas rotas do servidor Node/Express. Ele utiliza Spring Boot com Spring Web e Spring Data JPA para fornecer uma API REST e persiste os dados em PostgreSQL.

## Pré‑requisitos

* Java 17 ou superior instalado.
* Maven (ou Gradle) instalado para compilar o projeto.
* Um servidor PostgreSQL rodando, com banco de dados, usuário e senha configurados (por exemplo, host `localhost`, banco `rotina`, usuário `postgres`, senha `1234`).

## Configuração do banco

Altere o arquivo `src/main/resources/application.properties` com as credenciais do seu banco. Por padrão, está configurado para:

```
spring.datasource.url=jdbc:postgresql://localhost:5432/rotina
spring.datasource.username=postgres
spring.datasource.password=1234
spring.jpa.hibernate.ddl-auto=update
```

O `ddl-auto=update` faz com que o Hibernate crie (ou atualize) as tabelas automaticamente conforme as entidades. Para produção, ajuste esse parâmetro conforme necessário.

## Como rodar

1. Na raiz do módulo `routine-app-spring`, execute:

   ```bash
   mvn clean spring-boot:run
   ```

2. O servidor iniciará na porta `8080`. As rotas expostas são:
   * `GET /api/activities` – Lista atividades (agenda).
   * `POST /api/activities` – Cria nova atividade.
   * `GET /api/diet` – Lista registros de dieta.
   * `POST /api/diet` – Cria novo registro de dieta.
   * `GET /api/training` – Lista anotações de treino.
   * `POST /api/training` – Cria nova anotação de treino.
   * `GET /api/goals` – Lista metas.
   * `POST /api/goals` – Cria nova meta (semana/mês/ano).

O frontend Angular (ou qualquer outro cliente) pode consumir a API Spring da mesma forma que consumiria o backend Node. Se necessário, configure CORS ou mapeie um proxy para `/api` apontando para `http://localhost:8080`.

## Estrutura do código

```
routine-app-spring/
├── pom.xml                       # Configuração do Maven e dependências
└── src/main/java/com/example/routineapp/
    ├── RoutineAppApplication.java # Classe principal (ponto de entrada)
    ├── model/                     # Entidades JPA (Activity, DietLog, TrainingNote, Goal)
    ├── repository/                # Interfaces Spring Data JPA
    └── controller/                # Controladores REST
└── src/main/resources/
    └── application.properties     # Configuração de banco e outras propriedades
```
