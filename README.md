<div align="center">

# 🛰️ Space Guard

### Monitoramento inteligente de focos de incêndio em tempo real

Aplicativo mobile que une **dados oficiais do INPE**, **geolocalização**, **inteligência artificial** e **CRUD completo** para ajudar pessoas e equipes de campo a identificar e responder ao **risco de fogo** próximo a elas.

[![Expo](https://img.shields.io/badge/Expo-SDK%2056-000020?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.85-61DAFB?logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Platform](https://img.shields.io/badge/Plataforma-Android%20%7C%20iOS%20%7C%20Web-208AEF)](#-tecnologias)

### 🎬 [**Assista à apresentação do projeto no YouTube ▶️**](https://youtu.be/zInpZdRLr30)

</div>

---

## 📑 Sumário

- [🎯 Objetivo do projeto](#-objetivo-do-projeto)
- [✨ Funcionalidades](#-funcionalidades)
- [🧠 Diferenciais técnicos](#-diferenciais-técnicos)
- [🏗️ Arquitetura](#️-arquitetura)
- [🛠️ Tecnologias](#️-tecnologias)
- [🔐 Variáveis de ambiente](#-variáveis-de-ambiente)
- [🚀 Como rodar o projeto](#-como-rodar-o-projeto)
- [📦 Gerando o build (APK / device)](#-gerando-o-build-apk--device)
- [📂 Estrutura de pastas](#-estrutura-de-pastas)
- [🔌 Endpoints consumidos](#-endpoints-consumidos)
- [👥 Equipe](#-equipe)

---

## 🎯 Objetivo do projeto

Os incêndios florestais são um dos maiores problemas ambientais do Brasil, afetando biomas inteiros, comunidades e a economia. Hoje, os dados de focos de calor existem (via **INPE**), mas raramente chegam de forma **clara, contextualizada e acionável** para quem está em campo ou próximo das áreas de risco.

O **Space Guard** resolve isso transformando dados brutos de satélite em **informação útil e geolocalizada**:

- Mostra o **panorama nacional** de focos ativos e seus níveis de risco.
- Calcula, com base na **sua localização atual**, quais focos estão **perto de você**.
- Permite que equipes de campo **registrem onde estão** para histórico e acompanhamento.
- Oferece um **assistente de IA** que responde perguntas em linguagem natural sobre os dados.

> 🌎 **Tema:** Global Solution — Tecnologia aplicada à prevenção e resposta a desastres ambientais.

---

## ✨ Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| 🔐 **Autenticação** | Cadastro e login de usuários com **token JWT**. Campos com máscara automática (telefone) e busca de perfil completo após o login. |
| 🏠 **Dashboard (Home)** | Métricas em tempo real — **Focos Ativos**, **Risco Alto**, **Risco Médio** e **Precisão ML** — calculadas no cliente a partir dos focos. Lista detalhada por bioma/estado, *pull-to-refresh* e botão de **atualização de dados do INPE** (com cooldown). |
| ⚠️ **Risco por proximidade** | Usa o **GPS do dispositivo** e a **fórmula de Haversine** para listar os focos mais próximos, ordenados por distância, com **alerta** para focos de risco alto dentro de um raio de **100 km**. |
| 📍 **Campo (CRUD)** | Registro da localização atual do usuário (**Create**), listagem do último local + histórico (**Read**) e remoção de registros com confirmação (**Delete**). |
| 🤖 **Chat IA** | Assistente em linguagem natural (**Spring AI**), com contexto dos focos reais. Inclui sugestões prontas de perguntas. |
| 👤 **Perfil** | Edição dos dados da conta — nome, telefone, e-mail e senha (**Update**) — exclusão da conta (**Delete**) e logout. |

> ✅ **Cobertura de CRUD completa:** *Create* e *Read/Delete* no módulo Campo + *Update/Delete* no módulo Perfil.

---

## 🧠 Diferenciais técnicos

- 📡 **Pipeline de ingestão real do INPE** — o botão "Atualizar dados" dispara um microserviço assíncrono (`Ingestor → INPE → RabbitMQ → backend`), com **cooldown de 30 s** para evitar disparos repetidos.
- 🧭 **Cálculo de proximidade client-side** — distância geodésica via **Haversine**, sem depender do backend para ordenar focos por proximidade.
- 🤖 **IA com contexto de dados** — o chat consome um endpoint de **Spring AI** que considera os focos ativos ao responder.
- 🎨 **Design system próprio** — paleta centralizada (tema escuro "espacial"), ícones nativos (SF Symbols / Material), animações com **Reanimated** e *splash* animada.
- 🌐 **Multiplataforma** — Android, iOS e Web a partir da mesma base (Expo Router + file-based routing).

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                     APP MOBILE (Expo)                    │
│                                                          │
│   Telas            Hooks            Serviços             │
│   ─────            ─────            ────────             │
│   Dashboard   ←→   useDashboard ←→                       │
│   Risco       ←→   useRisco     ←→   api.ts ──┐          │
│   Campo       ←→   useCampo     ←→            │          │
│   Chat IA     ←→   useChat      ←→            │          │
│   Perfil/Login ──────────────────────────────┤          │
│                                               │          │
│   AuthContext (user + token JWT) ─────────────┘          │
└──────────────────────────────┬──────────────────────────┘
                               │ HTTP (REST + JWT)
              ┌────────────────┴────────────────┐
              ▼                                  ▼
   ┌──────────────────────┐         ┌───────────────────────────┐
   │  Backend Spring Boot │         │  Microserviço de Ingestão │
   │  (auth, focos, chat, │         │  INPE → RabbitMQ → backend│
   │   local-usuario)     │         │  (porta separada)         │
   └──────────────────────┘         └───────────────────────────┘
```

A camada de acesso a dados é centralizada em [`src/services/api.ts`](src/services/api.ts), que expõe serviços tipados (`authService`, `focoService`, `chatService`, `localService`, `usuarioService`, `ingestService`) e trata o envelope HATEOAS (`_embedded`) e respostas `204 No Content`. O estado de sessão (usuário + token) vive no [`AuthContext`](src/contexts/AuthContext.tsx).

---

## 🛠️ Tecnologias

| Categoria | Stack |
|-----------|-------|
| **Core** | React Native `0.85`, React `19.2`, TypeScript `6.0` |
| **Framework** | Expo SDK `56`, Expo Router (file-based routing) |
| **Navegação** | `expo-router` (Tabs) |
| **Animações** | `react-native-reanimated`, `react-native-worklets` |
| **Localização** | `expo-location` |
| **UI / Ícones** | `expo-symbols`, `expo-glass-effect`, `@expo/ui`, `expo-image` |
| **Build nativo** | `expo-build-properties` (cleartext traffic no Android) |
| **Backend (consumido)** | Spring Boot + Spring AI + RabbitMQ |

---

## 🔐 Variáveis de ambiente

O app usa variáveis `EXPO_PUBLIC_*`, que são **embutidas no momento do build**. Crie um arquivo `.env` na raiz do projeto:

```env
# URL base do backend (autenticação, focos, chat, local-usuario)
EXPO_PUBLIC_API_URL=http://spaceguard-rm560512.eastus2.azurecontainer.io:8080

# URL COMPLETA do endpoint de ingestão de dados do INPE (microserviço separado)
EXPO_PUBLIC_INGEST_URL=http://spaceguard-rm560512.eastus2.azurecontainer.io:8083/importar
```

| Variável | Obrigatória | Descrição |
|----------|:-----------:|-----------|
| `EXPO_PUBLIC_API_URL` | ✅ | URL base da API REST principal. Sem ela, o app usa o fallback `http://localhost:8080`. |
| `EXPO_PUBLIC_INGEST_URL` | ✅ | URL completa do endpoint de coleta de dados do INPE. Fallback: `http://localhost:8083/importar`. |

> ⚠️ **Importante:** como o backend é servido via **HTTP** (sem TLS), o Android (API 28+) bloqueia *cleartext traffic* por padrão. O projeto já habilita isso via `expo-build-properties` no [`app.json`](app.json) (`usesCleartextTraffic: true`).
>
> 📦 **Builds com EAS:** o `.env` é *gitignored* e **não sobe** para os servidores do EAS Build. Por isso as variáveis também estão declaradas em [`eas.json`](eas.json), dentro de cada perfil de build (`development`, `preview`, `production`).

---

## 🚀 Como rodar o projeto

### Pré-requisitos
- [Node.js](https://nodejs.org) `>= 20`
- [npm](https://www.npmjs.com/) (ou Yarn / pnpm)
- App **Expo Go** (testes rápidos) ou um **development build** (recursos nativos)

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/FIAP-MOBILE-2025-Agosto/2tdspr-global-solution-2-spaceguard.git
cd 2tdspr-global-solution-2-spaceguard

# 2. Instale as dependências
npm install

# 3. Crie o arquivo .env (veja a seção "Variáveis de ambiente")

# 4. Inicie o servidor de desenvolvimento
npx expo start
```

No terminal você poderá abrir o app em:

```bash
npm run android   # Emulador / dispositivo Android
npm run ios       # Simulador iOS
npm run web       # Navegador
```

> 💡 Se alterar o `.env`, reinicie o Metro com cache limpo: `npx expo start --clear`.

---

## 📦 Gerando o build (APK / device)

Recursos nativos (localização, cleartext traffic) **não funcionam no Expo Go** — é preciso um build real via **EAS**:

```bash
# Build interno em APK para Android (perfil preview)
eas build --profile preview --platform android

# Build de desenvolvimento (com dev client)
eas build --profile development --platform android
```

Após o build, **reinstale o APK** no dispositivo. As variáveis de ambiente e a configuração de cleartext traffic já estarão embutidas no binário.

---

## 📂 Estrutura de pastas

```
space-guard-mobile/
├── app.json                 # Configuração do Expo (plugins, permissões, build properties)
├── eas.json                 # Perfis de build EAS + variáveis de ambiente
├── src/
│   ├── app/                 # Rotas (file-based routing)
│   │   ├── _layout.tsx      # Layout raiz + gate de autenticação
│   │   ├── index.tsx        # Home / Dashboard
│   │   ├── chat.tsx         # Chat IA
│   │   ├── risco.tsx        # Risco por proximidade
│   │   └── campo.tsx        # Registro de localização (CRUD)
│   ├── components/          # Componentes reutilizáveis (login, tabs, toast, menu…)
│   ├── screens/             # Telas + seus hooks e subcomponentes
│   │   ├── dashboard/
│   │   ├── risco/
│   │   ├── campo/
│   │   ├── chat/
│   │   └── perfil/
│   ├── contexts/            # AuthContext (sessão + token JWT)
│   ├── services/            # api.ts — camada de acesso ao backend
│   ├── utils/               # geo (Haversine), formatação
│   ├── constants/           # paleta de cores e constantes
│   └── types/               # tipagens (DTOs do backend + modelos de UI)
└── assets/                  # ícones, splash e imagens
```

---

## 🔌 Endpoints consumidos

| Serviço | Método | Endpoint | Uso |
|---------|:------:|----------|-----|
| Auth | `POST` | `/auth/login` | Login (retorna token JWT) |
| Auth | `POST` | `/auth/register` | Cadastro de usuário |
| Auth | `GET` | `/auth/me` | Perfil do usuário autenticado |
| Auth | `PATCH` | `/auth/{id}` | Atualização de dados do usuário |
| Auth | `DELETE` | `/auth/{id}` | Exclusão da conta |
| Focos | `GET` | `/foco-incendio` | Lista de focos de incêndio |
| Chat IA | `POST` | `/chat` | Pergunta em linguagem natural (Spring AI) |
| Local | `POST` | `/local-usuario` | Registrar localização (Create) |
| Local | `GET` | `/local-usuario/ultimoLocal/usuario/{id}` | Último local registrado |
| Local | `GET` | `/local-usuario/usuario/{id}` | Histórico de locais (Read) |
| Local | `DELETE` | `/local-usuario/{idLocal}` | Remover localização (Delete) |
| Ingestão | `POST` | `/importar` | Disparar coleta de dados do INPE |

---

## 👥 Equipe

Projeto desenvolvido para a **Global Solution** — FIAP, turma **2TDSPR** (Análise e Desenvolvimento de Sistemas).

> 🎬 **Demonstração completa em vídeo:** [https://youtu.be/zInpZdRLr30](https://youtu.be/zInpZdRLr30)

---

<div align="center">

**🛰️ Space Guard** — *Tecnologia a serviço da prevenção de incêndios.*

</div>
