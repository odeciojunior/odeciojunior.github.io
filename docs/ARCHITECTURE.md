# 📚 Projeto odeciojunior.github.io - Documentação de Arquitetura

## 🎯 Visão Geral

Este projeto é um blog pessoal desenvolvido com **Astro 5.12.0**, focado em performance e experiência do desenvolvedor. Utiliza uma arquitetura de geração estática (SSG) com minimal JavaScript, seguindo princípios de progressive enhancement.

## 🏗️ Stack Tecnológica

### Core Framework
- **Astro 5.12.0** - Framework SSG principal
- **TypeScript 5.8.3** - Type safety e melhor DX
- **Node.js** - Runtime JavaScript

### Styling & UI
- **TailwindCSS 4.1.11** - Utility-first CSS framework
- **CSS Custom Properties** - Sistema de temas dark/light
- **Typography Plugin** - Estilos de conteúdo consistentes

### Content & Processing
- **Markdown** - Formato de conteúdo principal
- **Remark** - Processamento de Markdown com plugins:
  - `remark-toc` - Geração de índice
  - `remark-collapse` - Seções colapsáveis
- **Shiki** - Syntax highlighting com suporte a múltiplos temas

### Build & Optimization
- **Vite** - Build tool e dev server
- **Sharp 0.34.2** - Processamento de imagens
- **Satori** - Geração dinâmica de OG images
- **Pagefind** - Search engine estático

### Development Tools
- **ESLint 9.30.1** - Linting com suporte Astro
- **Prettier 3.6.2** - Formatação de código
- **commitizen** - Commits convencionais

## 📁 Estrutura do Projeto

```
odeciojunior.github.io/
├── src/
│   ├── assets/          # Recursos estáticos (ícones SVG)
│   │   └── icons/       # Biblioteca de ícones customizados
│   ├── components/      # Componentes Astro reutilizáveis
│   ├── data/           # Conteúdo do blog
│   │   └── blog/       # Posts em Markdown
│   ├── layouts/        # Layouts de página
│   │   ├── Layout.astro     # Layout principal
│   │   ├── Main.astro       # Layout de conteúdo
│   │   └── PostDetails.astro # Layout de posts
│   ├── pages/          # Rotas e páginas
│   │   ├── posts/      # Páginas dinâmicas de blog
│   │   ├── tags/       # Páginas de tags
│   │   ├── archives/   # Arquivo de posts
│   │   └── search.astro # Página de busca
│   ├── styles/         # Estilos globais
│   │   ├── global.css      # CSS global e variáveis
│   │   └── typography.css  # Estilos tipográficos
│   ├── utils/          # Funções utilitárias
│   │   ├── og-templates/   # Templates para OG images
│   │   └── transformers/   # Transformadores Shiki
│   ├── config.ts       # Configuração do site
│   └── constants.ts    # Constantes globais
├── public/            # Arquivos estáticos servidos diretamente
├── .claude-flow/      # Configurações Claude Flow
├── memory/           # Dados de sessão persistentes
└── docs/            # Documentação do projeto
```

## 🔄 Arquitetura de Componentes

### Hierarquia de Componentes

```
Layout.astro (Root)
├── Header.astro
│   ├── LinkButton.astro
│   └── Hr.astro
├── Main.astro / PostDetails.astro
│   ├── Breadcrumb.astro
│   ├── Card.astro
│   │   └── Datetime.astro
│   ├── Tag.astro
│   ├── ShareLinks.astro
│   └── BackToTopButton.astro
└── Footer.astro
    └── Socials.astro
        └── LinkButton.astro
```

### Categorização de Componentes

#### 1. **Layout Components** (3)
- `Header.astro` - Navegação e cabeçalho
- `Footer.astro` - Rodapé com links sociais
- `Hr.astro` - Separador horizontal

#### 2. **Content Components** (4)
- `Card.astro` - Cards de preview de posts
- `Tag.astro` - Display de tags
- `Datetime.astro` - Formatação de datas
- `Breadcrumb.astro` - Navegação breadcrumb

#### 3. **Navigation Components** (4)
- `LinkButton.astro` - Wrapper de links/botões
- `Pagination.astro` - Paginação de posts
- `BackButton.astro` - Botão voltar contextual
- `BackToTopButton.astro` - Scroll to top

#### 4. **Social Components** (3)
- `Socials.astro` - Links de redes sociais
- `ShareLinks.astro` - Compartilhamento de posts
- `EditPost.astro` - Link de edição (desabilitado)

## 🛣️ Sistema de Roteamento

### Rotas Estáticas
- `/` - Homepage com posts recentes
- `/about` - Página sobre
- `/search` - Busca com Pagefind
- `/404` - Página de erro

### Rotas Dinâmicas
- `/posts/[...page]` - Paginação de posts
- `/posts/[slug]` - Post individual
- `/tags` - Lista de tags
- `/tags/[tag]/[...page]` - Posts por tag
- `/archives` - Arquivo completo

### Rotas de API/Assets
- `/rss.xml` - Feed RSS
- `/robots.txt` - SEO robots
- `/og.png` - Open Graph image padrão
- `/posts/[slug]/index.png` - OG image por post

## 🔀 Fluxo de Dados

### 1. **Content Pipeline**
```
Markdown Files → Content Collections → 
Astro Pages → Static HTML → Browser
```

### 2. **Configuration Flow**
```
config.ts + constants.ts → 
Components → Rendered Output
```

### 3. **State Management**
- **Server-side**: Props passadas via Astro.props
- **Client-side**: Minimal JavaScript para:
  - Theme toggle (localStorage)
  - Mobile menu (DOM manipulation)
  - Back button (sessionStorage)
  - Scroll progress (requestAnimationFrame)

## 🎨 Sistema de Estilos

### Estrutura de Temas
```css
/* Light Theme (default) */
--background: #ffffff
--foreground: #1f1f20
--accent: #0076AA
--muted: #e8f3f8
--border: #D1DE42

/* Dark Theme */
--background: #1f1f20
--foreground: #ffffff
--accent: #D1DE42
--border: #0076AA
```

### Abordagens de Estilização
1. **Utility-first**: TailwindCSS classes
2. **Custom Properties**: Variáveis CSS para temas
3. **Scoped Styles**: Estilos isolados por componente
4. **Typography Plugin**: Estilos de conteúdo consistentes

## 🚀 Otimizações de Performance

### Build-time Optimizations
- **Static Generation**: Todo conteúdo pré-renderizado
- **Image Processing**: Sharp para otimização de imagens
- **Asset Optimization**: Vite bundling e minification
- **Code Splitting**: Automático com Astro

### Runtime Optimizations
- **Zero JavaScript by Default**: JS apenas quando necessário
- **Progressive Enhancement**: Funcionalidade core sem JS
- **Lazy Loading**: Imagens e conteúdo sob demanda
- **View Transitions**: Navegação suave entre páginas

## 🔧 Configurações e Build

### Scripts NPM
```json
{
  "dev": "astro dev",
  "build": "astro check && astro build && pagefind --site dist",
  "preview": "astro preview",
  "format": "prettier --write .",
  "lint": "eslint ."
}
```

### Configuração Astro
- **Site URL**: https://odeciojunior.github.io
- **Markdown Plugins**: TOC, Collapse, Shiki
- **Integrations**: Sitemap, TailwindCSS
- **Vite Plugins**: TailwindCSS v4

## 🔌 Integrações Externas

### 1. **Pagefind**
- Search engine estático
- Indexação pós-build
- Interface de busca customizada

### 2. **GitHub Pages**
- Deploy automático
- Domínio customizado suportado

### 3. **Google Site Verification**
- Variável de ambiente configurável
- SEO e Search Console

## 🧪 Estratégia de Testes

### Atual
- **Type Checking**: `astro check`
- **Linting**: ESLint com regras Astro
- **Formatting**: Prettier com plugin Astro

### Recomendações Futuras
- Unit tests com Vitest
- E2E tests com Playwright
- Visual regression tests
- Lighthouse CI para performance

## 📈 Métricas e Monitoramento

### Claude Flow Integration
- **Swarm Orchestration**: Coordenação multi-agente
- **Performance Tracking**: Métricas em `.claude-flow/metrics/`
- **Session Management**: Persistência em `memory/`

### Métricas Chave
- Build time
- Bundle size
- Lighthouse scores
- Search indexing stats

## 🚦 Padrões e Convenções

### Code Style
- **TypeScript**: Interfaces para props
- **Naming**: PascalCase para componentes
- **Imports**: Path aliases com `@/`
- **Comments**: JSDoc para funções complexas

### Git Workflow
- **Branches**: `main` para produção
- **Commits**: Conventional commits
- **CI/CD**: GitHub Actions (se configurado)

### Component Guidelines
1. Props sempre tipadas
2. Slots para composição flexível
3. Acessibilidade first (ARIA, semântica)
4. Progressive enhancement sempre

## 🔮 Roadmap e Melhorias Futuras

### Curto Prazo
- [ ] Adicionar testes automatizados
- [ ] Implementar CI/CD completo
- [ ] Melhorar documentação inline

### Médio Prazo
- [ ] Internacionalização (i18n)
- [ ] Analytics sem cookies
- [ ] Newsletter integration
- [ ] Comentários (utterances/giscus)

### Longo Prazo
- [ ] CMS headless integration
- [ ] API para conteúdo
- [ ] PWA capabilities
- [ ] A/B testing framework

## 📝 Notas de Manutenção

### Atualizações Regulares
- Dependências npm mensalmente
- Astro major versions com cautela
- TailwindCSS v4 ainda em alpha

### Pontos de Atenção
- Shiki themes requerem rebuild
- OG images cacheadas agressivamente
- Pagefind requer re-index após build

### Debugging Tips
- Use `astro dev --verbose` para logs detalhados
- Check `.claude-flow/metrics/` para performance
- Browser DevTools para View Transitions

---

*Última atualização: Janeiro 2025*
*Versão do documento: 1.0.0*