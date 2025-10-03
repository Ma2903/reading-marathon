# 🏅 Maratona de Leitura (Reading Marathon)

Aplicação full-stack de uma Maratona de Leitura com um painel de progresso coletivo em tempo real. Este projeto demonstra uma arquitetura moderna utilizando React para o frontend, Node.js para o backend, WebSockets para comunicação instantânea, RabbitMQ para mensageria e Docker para orquestração dos serviços.

---

## ✨ Funcionalidades

-   **Painel em Tempo Real:** Acompanhe o progresso da maratona sem precisar atualizar a página.
-   **Registro de Leitura:** Os participantes podem se identificar e registrar os livros e páginas lidas.
-   **Progresso Coletivo:** Uma barra de progresso visual mostra o total de páginas lidas pelo grupo em relação à meta.
-   **Ranking de Leitores:** Tabela de classificação que ordena os participantes por páginas lidas.
-   **Feed de Atividades:** Veja em tempo real as leituras que estão sendo registradas.
-   **Gráficos:** Visualização de dados como atividade por hora.

---

## 🛠️ Tecnologias Utilizadas

-   **Frontend:**
    -   [React](https://react.dev/) com [Vite](https://vitejs.dev/)
    -   [Tailwind CSS](https://tailwindcss.com/) para estilização
    -   [Recharts](https://recharts.org/) para gráficos
    -   [Lucide React](https://lucide.dev/) para ícones
-   **Backend:**
    -   [Node.js](https://nodejs.org/) com [Express](https://expressjs.com/)
    -   [WebSockets (ws)](https://github.com/websockets/ws) para comunicação em tempo real
-   **Mensageria:**
    -   [RabbitMQ](https://www.rabbitmq.com/) para gerenciar a fila de leituras registradas.
-   **Containerização:**
    -   [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

---

## 🚀 Como Executar o Projeto

Este projeto é 100% containerizado. Você só precisa ter o Docker e o Docker Compose instalados.

1.  **Clone o Repositório**
    ```bash
    git clone https://github.com/Ma2903/reading-marathon.git
    cd reading-marathon
    ```

2.  **Suba os Containers**
    Execute o comando abaixo na raiz do projeto. Ele irá construir as imagens e iniciar todos os serviços em segundo plano.
    ```bash
    docker-compose up --build -d
    ```

3.  **Acesse as Aplicações**
    -   🌐 **Frontend (Painel da Maratona):** [http://localhost:3000](http://localhost:3000)
    -   ⚙️ **Backend API:** [http://localhost:3001](http://localhost:3001)
    -   🐰 **Painel do RabbitMQ:** [http://localhost:15672](http://localhost:15672)
        -   **Usuário:** `admin`
        -   **Senha:** `admin123`

4.  **Para Parar a Aplicação**
    Para parar todos os containers, execute:
    ```bash
    docker-compose down
    ```

---

## 🏗️ Arquitetura

O fluxo de dados da aplicação funciona da seguinte maneira:
1.  O **Frontend** (React) permite que o usuário se registre e envie um formulário com os dados da leitura.
2.  A requisição é enviada para o **Backend** (Node.js/Express).
3.  O Backend publica a informação da leitura como uma mensagem em uma fila do **RabbitMQ**.
4.  Um "consumidor" no mesmo Backend escuta essa fila, processa a mensagem (atualiza o total de páginas e os dados dos participantes).
5.  Após processar, o Backend envia uma mensagem via **WebSocket** para todos os clientes (Frontends) conectados.
6.  O **Frontend** recebe a atualização via WebSocket e atualiza a interface do usuário em tempo real.

---

## 📜 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
