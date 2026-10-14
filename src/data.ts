export interface AIInfo {
  id: string;
  name: string;
  company: string;
  category: 'Relacionamento' | 'Pesquisa';
  type: string;
  mainFunction: string;
  howToUse: string;
  secondaryFunctions: string[];
  multimodal: {
    text: boolean;
    image: boolean;
    audio: boolean;
    video: boolean;
    files: boolean;
    pdf: boolean;
    details: string;
  };
  interface: {
    format: string;
    complexity: string;
    details: string;
  };
  technology: {
    modelType: string;
    details: string;
    online: boolean;
  };
  applications: {
    education: string;
    business: string;
    marketing: string;
    programming: string;
    design: string;
    personal: string;
  };
  versions: {
    free: string;
    paid: string;
  };
  limits: string;
  strengths: string[];
  limitations: string[];
  bestFor: string;
}

export const aiList: AIInfo[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    company: "OpenAI",
    category: "Relacionamento",
    type: "Texto / Vários Formatos / Praticidade",
    mainFunction: "É a campeã das conversas. Consegue escrever, resumir e tirar dúvidas sobre quase qualquer assunto como se fosse uma pessoa.",
    howToUse: "Acesse chatgpt.com ou baixe o aplicativo no celular. Crie uma conta e comece a escrever o que você precisa no campo de texto.",
    secondaryFunctions: [
      "Resumo de textos",
      "Tradução",
      "Criação de imagens (DALL-E 3)",
      "Análise de dados",
      "Criação de código",
      "Pesquisa na internet",
      "Criação de roteiros",
      "Simulação de conversas"
    ],
    multimodal: {
      text: true,
      image: true,
      audio: true,
      video: false,
      files: true,
      pdf: true,
      details: "Ela entende textos, fotos e até áudio. Você pode mandar vários arquivos que ela lê e analisa tudo pra você."
    },
    interface: {
      format: "Chat de conversa",
      complexity: "Fácil",
      details: "Interface bem limpa, com histórico de conversas e um modo de voz que parece gente de verdade."
    },
    technology: {
      modelType: "LLM (GPT-4o, o1)",
      details: "Usa redes neurais super complexas e foi treinada com a ajuda de humanos pra ser mais útil.",
      online: true
    },
    applications: {
      education: "Um professor particular que explica matérias difíceis de um jeito simples.",
      business: "Ajuda a escrever e-mails, relatórios e organizar as tarefas do trabalho.",
      marketing: "Cria textos para anúncios, posts e roteiros para vídeos.",
      programming: "Ajuda a encontrar erros em códigos e dá sugestões de como programar.",
      design: "Dá ideias para criar desenhos, logos e conceitos visuais.",
      personal: "Ajuda a planejar viagens, organizar o dia e dar dicas de saúde."
    },
    versions: {
      free: "Acesso ao modelo mais rápido e inteligente (GPT-4o) com limites diários.",
      paid: "Acesso total aos modelos mais potentes (o1), criação de IAs personalizadas e mais mensagens."
    },
    limits: "No plano grátis, após algumas mensagens o modelo volta para uma versão mais simples.",
    strengths: [
      "Extrema versatilidade",
      "Raciocínio lógico avançado (modelo o1)",
      "Ecossistema de GPTs personalizados"
    ],
    limitations: [
      "Alucinações ocasionais (pode inventar fatos)",
      "Pode tender a não discordar de você por ser uma IA de relacionamento (é importante pedir que ela seja verdadeira e discorde se necessário)",
      "Preocupações com privacidade de dados sensíveis",
      "Dependência de conexão estável"
    ],
    bestFor: "Versatilidade geral e raciocínio lógico"
  },
  {
    id: "gemini",
    name: "Google Gemini",
    company: "Google",
    category: "Pesquisa",
    type: "Texto / Vários Formatos / Pesquisa / Coisas do Google",
    mainFunction: "A IA do Google que já entende tudo: texto, foto e agora é uma das melhores para criar imagens realistas com o Imagen 3.",
    howToUse: "Acesse gemini.google.com com sua conta Google. Você pode falar, mandar fotos ou pedir para ele criar uma imagem do zero.",
    secondaryFunctions: [
      "Integração com Google Workspace (Docs, Gmail)",
      "Pesquisa avançada via Google Search",
      "Análise de vídeos do YouTube",
      "Geração de imagens de altíssima qualidade (Imagen 3)",
      "Geração de código de programação",
      "Tradução em tempo real",
      "Planejamento de rotas (Maps)"
    ],
    multimodal: {
      text: true,
      image: true,
      audio: true,
      video: true,
      files: true,
      pdf: true,
      details: "Ela entende várias coisas ao mesmo tempo, como vídeos e áudios, de um jeito muito natural."
    },
    interface: {
      format: "Chat e Integração Google",
      complexity: "Fácil",
      details: "Ótimo pra quem já usa Google, com um botão pra conferir se o que ela disse é verdade."
    },
    technology: {
      modelType: "LLM (Gemini 1.5 Pro/Flash)",
      details: "Consegue ler livros inteiros ou vídeos longos de uma vez só (janela de contexto gigante).",
      online: true
    },
    applications: {
      education: "Excelente para entender videoaulas e ler arquivos de estudo muito longos.",
      business: "Ajuda a organizar as tarefas do Google (Email, Agenda) e criar planos de trabalho.",
      marketing: "Ajuda a descobrir o que as pessoas estão buscando na internet.",
      programming: "Dá dicas de programação focadas nas linguagens mais modernas.",
      design: "Ajuda a organizar suas ideias visuais e cores.",
      personal: "Organiza suas viagens direto no Google Maps e acha os melhores voos."
    },
    versions: {
      free: "Acesso ao Gemini 1.5 Flash (super rápido) e geração de imagens grátis.",
      paid: "Acesso ao Gemini 1.5 Pro (raciocínio avançado), 2TB de Google One e IA dentro do Docs e Gmail."
    },
    limits: "No plano grátis, você pode criar de 10 a 50 imagens de alta qualidade por dia (via Imagen 3). Para textos, o uso é liberado com limites dinâmicos conforme a demanda.",
    strengths: [
      "Geração de imagens realistas (Melhor do mercado grátis)",
      "Janela de contexto gigante (lê livros inteiros)",
      "Integração profunda com serviços Google"
    ],
    limitations: [
      "Consistência variável em tarefas criativas",
      "Restrições geográficas em certas funções",
      "Filtros de segurança às vezes excessivos"
    ],
    bestFor: "Análise de grandes volumes de dados e ecossistema Google"
  },
  {
    id: "copilot",
    name: "Microsoft Copilot",
    company: "Microsoft",
    category: "Pesquisa",
    type: "Ajudante / Pesquisa / Trabalho",
    mainFunction: "O braço direito para quem usa computador com Windows e ferramentas de escritório (Office).",
    howToUse: "Clique no ícone colorido na barra de tarefas do Windows ou acesse copilot.microsoft.com.",
    secondaryFunctions: [
      "Pesquisa web via Bing",
      "Criação de apresentações em PowerPoint",
      "Análise de planilhas no Excel",
      "Redação no Word",
      "Geração de imagens (Designer)",
      "Resumo de reuniões no Teams"
    ],
    multimodal: {
      text: true,
      image: true,
      audio: true,
      video: false,
      files: true,
      pdf: true,
      details: "Focado em ajudar você a terminar seus documentos e pesquisas de trabalho."
    },
    interface: {
      format: "Chat e Barra Lateral",
      complexity: "Média",
      details: "Tá em todo lugar: no Windows, no Word e até no navegador Edge."
    },
    technology: {
      modelType: "LLM (GPT-4) + Bing Search",
      details: "Usa a inteligência da OpenAI mas turbinada com as buscas do Bing.",
      online: true
    },
    applications: {
      education: "Ajuda a fazer pesquisas escolares citando de onde veio a informação.",
      business: "Ótimo para criar atas de reunião e analisar planilhas de gastos.",
      marketing: "Escreve rascunhos para e-mails e posts de redes sociais.",
      programming: "Tira dúvidas simples de como escrever um comando.",
      design: "Cria imagens rápidas para usar em slides e apresentações.",
      personal: "Compara preços de produtos e ajuda a escolher o que comprar online."
    },
    versions: {
      free: "Uso do GPT-4 e pesquisa na internet sem pagar nada.",
      paid: "Uso prioritário em horários de pico e integração com Word, Excel e PowerPoint."
    },
    limits: "Limite de 30 mensagens por conversa no plano gratuito.",
    strengths: [
      "Citações diretas de fontes da web",
      "Integração nativa com Office 365",
      "Gratuidade para funções básicas"
    ],
    limitations: [
      "Interface às vezes poluída",
      "Limites de turnos por conversa",
      "Lentidão ocasional na busca"
    ],
    bestFor: "Produtividade corporativa e pesquisa com fontes"
  },
  {
    id: "claude",
    name: "Claude",
    company: "Anthropic",
    category: "Relacionamento",
    type: "Texto / Programação / Análise / Cuidadosa",
    mainFunction: "A IA que escreve de um jeito mais bonito e parece mais 'humana' nas respostas.",
    howToUse: "Acesse claude.ai. É ótimo para colar textos longos e pedir para ele explicar ou resumir.",
    secondaryFunctions: [
      "Análise profunda de documentos",
      "Programação avançada (Artifacts)",
      "Automação de tarefas (combina muito com o N8N)",
      "Escrita criativa e revisão técnica",
      "Resumo de livros inteiros",
      "Extração de dados de planilhas e PDFs"
    ],
    multimodal: {
      text: true,
      image: true,
      audio: false,
      video: false,
      files: true,
      pdf: true,
      details: "Lidera em tarefas de automação complexa e análise de arquivos, sendo o parceiro ideal do N8N para criar fluxos automáticos."
    },
    interface: {
      format: "Chat com 'Artifacts'",
      complexity: "Fácil",
      details: "Interface limpa. O 'Artifacts' deixa você ver o código ou texto pronto do lado da conversa."
    },
    technology: {
      modelType: "LLM (Claude 3.5 Sonnet/Opus)",
      details: "Treinado pra ser super ético e seguro, evitando respostas perigosas.",
      online: true
    },
    applications: {
      education: "Perfeito para escrever textos escolares e analisar livros difíceis.",
      business: "Líder em automação profissional. Use junto com o **N8N** para fazer sua empresa rodar no piloto automático.",
      marketing: "Escreve textos que parecem menos 'robôs' e mais naturais.",
      programming: "É um dos melhores para criar sistemas e aplicativos inteiros.",
      design: "Dá ideias criativas para nomes e slogans.",
      personal: "Ajuda a escrever cartas bonitas e organizar pensamentos."
    },
    versions: {
      free: "Acesso ao Claude 3.5 Sonnet, um dos melhores modelos do mundo.",
      paid: "Acesso ao modelo mais potente (Claude 3 Opus) e 5x mais mensagens por dia."
    },
    limits: "Tem um número limitado de mensagens por dia que renova a cada poucas horas.",
    strengths: [
      "Tom de voz mais natural e humano",
      "Janela de contexto de 200k créditos",
      "Capacidade superior de codificação"
    ],
    limitations: [
      "Não gera imagens diretamente",
      "Sem acesso direto à internet em tempo real (em algumas versões)",
      "Filtros de segurança às vezes rígidos demais"
    ],
    bestFor: "Escrita de qualidade e programação"
  },
  {
    id: "meta-ai",
    name: "Meta AI",
    company: "Meta",
    category: "Relacionamento",
    type: "Redes Sociais / Texto / Fotos / Ajudante",
    mainFunction: "O ajudante que já vem dentro do seu WhatsApp e Instagram.",
    howToUse: "No WhatsApp, procure pelo círculo colorido nos seus contatos ou digite @MetaAI em um grupo.",
    secondaryFunctions: [
      "Geração rápida de imagens",
      "Respostas rápidas em chats sociais",
      "Busca de informações via parcerias",
      "Criação de figurinhas personalizadas",
      "Recomendações de locais"
    ],
    multimodal: {
      text: true,
      image: true,
      audio: false,
      video: false,
      files: false,
      pdf: false,
      details: "Feito pra você usar enquanto conversa com os amigos ou navega no Insta."
    },
    interface: {
      format: "Chat em Apps de Rede Social",
      complexity: "Muito Fácil",
      details: "É só chamar como se fosse um contato qualquer no Zap."
    },
    technology: {
      modelType: "LLM (Llama 3)",
      details: "Usa o modelo Llama da Meta, que é super rápido e eficiente.",
      online: true
    },
    applications: {
      education: "Tira dúvidas rápidas de um jeito fácil e curto.",
      business: "Ajuda no atendimento de clientes em redes sociais.",
      marketing: "Dá ideias de legendas e temas para suas postagens.",
      programming: "Responde dúvidas rápidas de comandos de computador.",
      design: "Cria imagens rápidas enquanto você escreve.",
      personal: "Ajuda a combinar encontros com amigos direto no grupo do Zap."
    },
    versions: {
      free: "Totalmente gratuito, já vem embutido nos seus aplicativos da Meta.",
      paid: "Não disponível (é um recurso grátis das redes sociais)."
    },
    limits: "Não tem um limite claro, mas pode ficar indisponível em momentos de manutenção.",
    strengths: [
      "Acessibilidade extrema (WhatsApp)",
      "Velocidade de resposta",
      "Geração de imagens em tempo real enquanto digita"
    ],
    limitations: [
      "Menos profundo que ChatGPT ou Claude",
      "Privacidade em ambiente de rede social",
      "Funcionalidades limitadas para arquivos complexos"
    ],
    bestFor: "Uso casual e redes sociais"
  },
  {
    id: "midjourney",
    name: "Midjourney",
    company: "Midjourney Inc.",
    category: "Pesquisa",
    type: "Fotos / Desenho / Arte",
    mainFunction: "A ferramenta número 1 para criar artes digitais, logotipos e fotos realistas que enganam qualquer um. É como ter o melhor artista do mundo à sua disposição.",
    howToUse: "Use pelo midjourney.com (agora com site próprio!) ou pelo Discord. Você escreve o que imagina e ele te entrega 4 versões da sua ideia.",
    secondaryFunctions: [
      "Criação de logos e identidades visuais",
      "Fotografia realista de produtos e paisagens",
      "Estilos de cinema, pintura e ilustração",
      "Edição 'Vary Region' (mudar apenas uma parte da foto)",
      "Mistura de fotos (Blend) para criar novos conceitos",
      "Upscaling (aumentar tamanho sem perder qualidade)"
    ],
    multimodal: {
      text: true,
      image: true,
      audio: false,
      video: false,
      files: false,
      pdf: false,
      details: "Você descreve o que quer e ela cria. Também pode usar uma foto sua como referência."
    },
    interface: {
      format: "Discord / Site",
      complexity: "Um pouco difícil",
      details: "A maioria das pessoas usa pelo Discord, o que pode ser meio confuso no começo."
    },
    technology: {
      modelType: "Modelo de Difusão",
      details: "Focada totalmente em estética e detalhes visuais que impressionam.",
      online: true
    },
    applications: {
      education: "Usado para ilustrar trabalhos escolares com imagens únicas.",
      business: "Ajuda a criar conceitos de novos produtos e ideias visuais.",
      marketing: "Cria imagens poderosas para propaganda e anúncios.",
      programming: "Dá ideias de desenhos para personagens e cenários de jogos.",
      design: "Ajuda designers a terem ideias para cores, luzes e estilos.",
      personal: "Cria fotos de perfis (avatares) bonitas e artes para decorar a casa."
    },
    versions: {
      free: "Não oferece mais teste gratuito (antes era possível criar algumas imagens).",
      paid: "Planos a partir de cerca de 10 dólares por mês para criar muitas imagens."
    },
    limits: "Depende do plano escolhido (você 'paga' pelo tempo de uso do computador deles).",
    strengths: [
      "Qualidade estética inigualável",
      "Comunidade ativa e feedback visual",
      "Controle fino sobre iluminação e textura"
    ],
    limitations: [
      "Curva de aprendizado íngreme",
      "Dependência do Discord (para a maioria)",
      "Dificuldade com textos dentro de imagens"
    ],
    bestFor: "Arte digital e design profissional"
  },
  {
    id: "dalle",
    name: "DALL·E",
    company: "OpenAI",
    category: "Pesquisa",
    type: "Fotos / Desenho",
    mainFunction: "Cria imagens bonitas só de você pedir, direto na conversa.",
    howToUse: "Funciona direto dentro do ChatGPT Plus ou pelo site do Bing Image Creator.",
    secondaryFunctions: [
      "Edição de imagens conversando",
      "Integração com ChatGPT",
      "Criação de logos e ícones",
      "Escreve textos dentro das imagens"
    ],
    multimodal: {
      text: true,
      image: true,
      audio: false,
      video: false,
      files: false,
      pdf: false,
      details: "Como tá dentro do ChatGPT, você pode ir conversando e pedindo ajustes na imagem."
    },
    interface: {
      format: "Chat (pelo ChatGPT)",
      complexity: "Muito Fácil",
      details: "Não precisa de comandos técnicos, é só falar o que você quer em português mesmo."
    },
    technology: {
      modelType: "Modelo de Difusão + LLM",
      details: "O ChatGPT ajuda a 'traduzir' o seu pedido pra IA de imagem entender melhor.",
      online: true
    },
    applications: {
      education: "Ajuda a criar imagens para explicar história ou ciências.",
      business: "Cria desenhos rápidos para colocar em cartazes e anúncios.",
      marketing: "Ótimo para posts de redes sociais e pequenos anúncios.",
      programming: "Cria ícones e botões para sites e aplicativos.",
      design: "Ajuda a ter ideias visuais rápidas para qualquer projeto.",
      personal: "Ajuda a criar convites de aniversário e cartões de presente."
    },
    versions: {
      free: "Pode ser usado com limites através do Microsoft Copilot (Bing).",
      paid: "Uso incluído na assinatura do ChatGPT Plus."
    },
    limits: "No Copilot, você pode criar cerca de 15 a 30 imagens por dia gratuitamente.",
    strengths: [
      "Facilidade de uso extrema",
      "Excelente compreensão de instruções complexas",
      "Boa renderização de texto"
    ],
    limitations: [
      "Menos controle artístico que Midjourney",
      "Estilo às vezes excessivamente 'digital' ou 'limpo'",
      "Restrições de direitos autorais rígidas"
    ],
    bestFor: "Facilidade e precisão de prompt"
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion",
    company: "Stability AI",
    category: "Pesquisa",
    type: "Fotos / Aberta / Para quem entende mais",
    mainFunction: "A IA de criar imagens para quem gosta de mexer em detalhes e quer total privacidade.",
    howToUse: "Geralmente requer instalação no computador ou uso de sites como Clipdrop ou Hugging Face.",
    secondaryFunctions: [
      "Treinar a IA com suas fotos",
      "Funciona sem internet",
      "Controle total da pose e luz",
      "Criação de vídeos curtos",
      "Animações"
    ],
    multimodal: {
      text: true,
      image: true,
      audio: false,
      video: true,
      files: false,
      pdf: false,
      details: "Dá pra criar imagens, vídeos e até uns efeitos bem doidos se você souber mexer."
    },
    interface: {
      format: "Programas no PC",
      complexity: "Difícil",
      details: "Geralmente você instala no seu computador. Tem um monte de botão e ajuste técnico."
    },
    technology: {
      modelType: "Modelo de Difusão Aberto",
      details: "É código aberto, então qualquer um pode criar versões novas e melhoradas.",
      online: false
    },
    applications: {
      education: "Estudo de arquitetura de redes neurais.",
      business: "Geração de assets em larga escala sem custos de API.",
      marketing: "Criação de modelos virtuais consistentes.",
      programming: "Desenvolvimento de ferramentas de IA próprias.",
      design: "Controle absoluto sobre a composição.",
      personal: "Uso privado sem censura de nuvem."
    },
    versions: {
      free: "Totalmente gratuito para sempre (você só paga a energia do seu PC!).",
      paid: "Não aplicável por ser um programa de código aberto."
    },
    limits: "O único limite é a potência do seu computador (placa de vídeo).",
    strengths: [
      "Gratuito (se rodar localmente)",
      "Privacidade total",
      "Customização infinita"
    ],
    limitations: [
      "Requer hardware potente (GPU)",
      "Configuração técnica complexa",
      "Qualidade base inferior ao Midjourney sem ajustes"
    ],
    bestFor: "Customização técnica e privacidade"
  },
  {
    id: "canva-ia",
    name: "Canva IA",
    company: "Canva",
    category: "Pesquisa",
    type: "Desenho / Criação / Criatividade",
    mainFunction: "Ferramentas mágicas para deixar seus designs (cartazes, convites) profissionais bem rápido.",
    howToUse: "Abra o Canva e procure pelo botão 'Estúdio Mágico' ou use o 'Texto Mágico' nos seus designs.",
    secondaryFunctions: [
      "Escrita mágica (textos)",
      "Trocar objetos na foto",
      "Criar imagens e vídeos",
      "Montar layouts sozinho",
      "Traduzir artes",
      "Tirar o fundo de fotos"
    ],
    multimodal: {
      text: true,
      image: true,
      audio: false,
      video: true,
      files: true,
      pdf: true,
      details: "Tudo focado em facilitar a criação de posts, slides e vídeos."
    },
    interface: {
      format: "Editor Visual",
      complexity: "Fácil",
      details: "É o Canva que você já conhece, mas com botões mágicos que fazem o trabalho duro."
    },
    technology: {
      modelType: "Várias IAs juntas",
      details: "Eles usam o melhor de várias tecnologias pra deixar tudo simples pra você.",
      online: true
    },
    applications: {
      education: "Perfeito para criar cartazes e trabalhos de escola bem bonitos.",
      business: "Ajuda a criar logotipos, papéis de carta e relatórios da empresa.",
      marketing: "Facilita a criação de posts para Instagram e Facebook.",
      programming: "Infelizmente não serve muito para programar.",
      design: "Permite que qualquer pessoa crie artes profissionais sem ser designer.",
      personal: "Ajuda a montar convites de festa e álbuns de fotos de família."
    },
    versions: {
      free: "Muitas ferramentas mágicas básicas estão disponíveis grátis.",
      paid: "Acesso ilimitado a todas as ferramentas de IA e biblioteca de imagens premium."
    },
    limits: "Algumas funções de IA têm um número limitado de usos por mês para usuários grátis.",
    strengths: [
      "Fluxo de trabalho completo em um só lugar",
      "Enorme biblioteca de assets",
      "Fácil para iniciantes"
    ],
    limitations: [
      "Menos potente para arte complexa",
      "Muitas funções exigem assinatura Pro",
      "Dependência de templates"
    ],
    bestFor: "Design rápido e acessível"
  },
  {
    id: "notion-ai",
    name: "Notion AI",
    company: "Notion Labs",
    category: "Pesquisa",
    type: "Organização / Texto / Anotações",
    mainFunction: "O cérebro digital que ajuda você a arrumar suas notas, listas e projetos.",
    howToUse: "Dentro de qualquer página do Notion, aperte a tecla de espaço e peça ajuda para a IA.",
    secondaryFunctions: [
      "Resumir anotações",
      "Criar listas de tarefas",
      "Melhorar o que você escreveu",
      "Dar ideias de conteúdo",
      "Traduzir páginas",
      "Buscar coisas no seu espaço"
    ],
    multimodal: {
      text: true,
      image: false,
      audio: false,
      video: false,
      files: true,
      pdf: true,
      details: "Focado em entender seus textos e organizar suas tabelas."
    },
    interface: {
      format: "Editor de Texto",
      complexity: "Fácil",
      details: "É só apertar a barra (/) ou selecionar um texto que a IA aparece."
    },
    technology: {
      modelType: "LLM (GPT-4 / Claude)",
      details: "Fica direto dentro das suas páginas, então ela conhece todo o seu trabalho.",
      online: true
    },
    applications: {
      education: "Organiza suas anotações de estudo e faz resumos automáticos.",
      business: "Guarda todos os manuais e regras da empresa em um só lugar.",
      marketing: "Ajuda a planejar o que postar durante o mês inteiro.",
      programming: "Ajuda a organizar as explicações de como um sistema funciona.",
      design: "Ótimo para anotar ideias de projetos e cores.",
      personal: "Funciona como um diário ou lista de compras inteligente."
    },
    versions: {
      free: "Dá para testar algumas vezes, mas as respostas são limitadas no plano grátis.",
      paid: "Acesso ilimitado à inteligência e melhores respostas dentro do Notion."
    },
    limits: "Você tem um limite de respostas de IA que renova todo mês.",
    strengths: [
      "Contexto total sobre suas notas",
      "Organização automática de dados",
      "Melhora o fluxo de escrita"
    ],
    limitations: [
      "Custo adicional à assinatura",
      "Limitado ao ambiente Notion",
      "Não gera mídia visual"
    ],
    bestFor: "Gestão de conhecimento e escrita"
  },
  {
    id: "grammarly",
    name: "Grammarly",
    company: "Grammarly Inc.",
    category: "Pesquisa",
    type: "Texto / Ajudante / Estudo",
    mainFunction: "O corretor que deixa seu texto sem erros e com o tom de conversa ideal.",
    howToUse: "Instale a extensão no seu navegador ou use o aplicativo para revisar seus e-mails e textos.",
    secondaryFunctions: [
      "Correção de gramática",
      "Checar se é plágio",
      "Mudar o tom (formal/amigável)",
      "Sugestões pra escrever melhor",
      "Criar rascunhos inteiros"
    ],
    multimodal: {
      text: true,
      image: false,
      audio: false,
      video: false,
      files: true,
      pdf: false,
      details: "Especialista total em texto e escrita correta."
    },
    interface: {
      format: "Extensão / App",
      complexity: "Muito Fácil",
      details: "Fica ali no cantinho enquanto você digita em qualquer site ou app."
    },
    technology: {
      modelType: "IA de Linguagem",
      details: "Mistura regras de português/inglês com a inteligência das IAs modernas.",
      online: true
    },
    applications: {
      education: "Ajuda a aprender a escrever melhor e praticar inglês.",
      business: "Revisa seus e-mails de trabalho para não ter nenhum erro feio.",
      marketing: "Melhora os textos de propaganda para ficarem mais chamativos.",
      programming: "Deixa as explicações técnicas mais fáceis de ler.",
      design: "Ajuda a escolher as palavras certas para colocar em botões.",
      personal: "Ajuda a escrever mensagens claras em redes sociais."
    },
    versions: {
      free: "Corrige erros básicos e sugere melhorias simples de forma gratuita.",
      paid: "Reescreve seu texto inteiro para ele parecer mais profissional ou carinhoso."
    },
    limits: "Pode ser usado livremente, mas as dicas melhores só aparecem na versão paga.",
    strengths: [
      "Precisão linguística",
      "Funciona em quase qualquer lugar (browser)",
      "Foco em clareza e profissionalismo"
    ],
    limitations: [
      "Pode tornar a escrita genérica",
      "Versão gratuita limitada",
      "Foco principal em Inglês (embora expanda)"
    ],
    bestFor: "Refinamento de escrita profissional"
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    company: "Perplexity",
    category: "Pesquisa",
    type: "Pesquisa / Texto / Descobrir",
    mainFunction: "O buscador que não te dá links, te dá respostas prontas e explicadas. É a melhor ferramenta para quem precisa pesquisar textos profundos, acadêmicos ou notícias com fontes reais.",
    howToUse: "Acesse perplexity.ai. Digite sua pergunta como se estivesse conversando com um bibliotecário super inteligente.",
    secondaryFunctions: [
      "Busca em tempo real na internet",
      "Escrita de textos com base em fatos",
      "Citação automática de fontes (links)",
      "Análise de arquivos e PDFs",
      "Organização de pesquisas em Coleções",
      "Criação de 'Pages' (artigos prontos)"
    ],
    multimodal: {
      text: true,
      image: true,
      audio: false,
      video: false,
      files: true,
      pdf: true,
      details: "Especialista em processar montanhas de texto e extrair a verdade com fontes citadas."
    },
    interface: {
      format: "Barra de Busca / Chat",
      complexity: "Fácil",
      details: "Parece um buscador comum, mas ele te entrega a resposta pronta e as fontes."
    },
    technology: {
      modelType: "LLM + Busca na Web",
      details: "É como se fosse um bibliotecário super inteligente que lê a internet pra você.",
      online: true
    },
    applications: {
      education: "Ajuda a fazer pesquisas rápidas e confiáveis para o colégio.",
      business: "Analisa o que os concorrentes estão fazendo no mercado.",
      marketing: "Descobre quais são as novidades e tendências do momento.",
      programming: "Acha soluções para problemas de computador explicando a fonte.",
      design: "Ajuda a encontrar referências de imagens e estilos.",
      personal: "Tira aquelas dúvidas bobas do dia a dia com muita certeza."
    },
    versions: {
      free: "Buscas ilimitadas usando modelos rápidos e consulta à internet.",
      paid: "Uso de modelos muito potentes (como GPT-4o e Claude) e análise de arquivos grandes."
    },
    limits: "No plano grátis, você pode fazer 5 buscas 'Pro' (mais detalhadas) por dia.",
    strengths: [
      "Transparência total de fontes",
      "Informação em tempo real",
      "Sem anúncios invasivos"
    ],
    limitations: [
      "Depende da qualidade das fontes web",
      "Menos criativo para ficção",
      "Pode resumir errado fontes complexas"
    ],
    bestFor: "Substituir buscas tradicionais por respostas diretas"
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    company: "GitHub (Microsoft)",
    category: "Pesquisa",
    type: "Programação / Criar Sistemas",
    mainFunction: "O ajudante que escreve códigos de computador junto com você.",
    howToUse: "Instale a extensão no VS Code e ele começará a sugerir código enquanto você digita.",
    secondaryFunctions: [
      "Completar funções inteiras",
      "Criar testes automáticos",
      "Explicar códigos difíceis",
      "Arrumar erros (bugs)",
      "Traduzir de uma linguagem pra outra"
    ],
    multimodal: {
      text: true,
      image: false,
      audio: false,
      video: false,
      files: true,
      pdf: false,
      details: "Ele 'lê' todo o seu projeto pra dar sugestões que fazem sentido."
    },
    interface: {
      format: "Dentro do Editor de Código",
      complexity: "Difícil",
      details: "Fica direto no VS Code ou outros programas que programadores usam."
    },
    technology: {
      modelType: "LLM de Código",
      details: "Foi treinado com bilhões de linhas de código de programadores do mundo todo.",
      online: true
    },
    applications: {
      education: "Ajuda estudantes de computação a aprenderem novas linguagens.",
      business: "Faz os sistemas da empresa serem criados muito mais rápido.",
      marketing: "Não ajuda muito nessa parte de propaganda.",
      programming: "É a ferramenta favorita dos programadores para escrever código.",
      design: "Ajuda a criar o visual de sites usando comandos de estilo.",
      personal: "Ajuda a criar pequenos programas para automatizar a casa."
    },
    versions: {
      free: "Não é gratuito (exceto se você for estudante ou professor).",
      paid: "Assinatura mensal de cerca de 10 dólares para uso profissional."
    },
    limits: "Uso ilimitado após a assinatura.",
    strengths: [
      "Aumento drástico na velocidade de codificação",
      "Sugestões contextuais precisas",
      "Suporta quase todas as linguagens"
    ],
    limitations: [
      "Pode sugerir código com vulnerabilidades",
      "Risco de violação de licenças de código",
      "Pode desencorajar o aprendizado profundo"
    ],
    bestFor: "Desenvolvedores de software"
  },
  {
    id: "notebooklm",
    name: "NotebookLM",
    company: "Google",
    category: "Pesquisa",
    type: "Pesquisa / Estudo / Análise",
    mainFunction: "A IA que cria um 'resumo inteligente' usando seus próprios arquivos e anotações.",
    howToUse: "Acesse notebooklm.google.com e envie seus PDFs ou textos para começar a conversar com eles.",
    secondaryFunctions: [
      "Resumo de documentos pessoais",
      "Criação de guias de estudo",
      "Geração de podcasts (Audio Overview)",
      "Busca em múltiplos PDFs",
      "Criação de notas estruturadas",
      "Sugestão de conexões entre ideias"
    ],
    multimodal: {
      text: true,
      image: false,
      audio: true,
      video: false,
      files: true,
      pdf: true,
      details: "Especialista em processar seus arquivos (PDFs, Google Docs, sites) e transformá-los em conhecimento."
    },
    interface: {
      format: "Caderno Digital",
      complexity: "Média",
      details: "Funciona como um caderno onde você joga suas fontes e conversa com elas."
    },
    technology: {
      modelType: "LLM (Gemini 1.5 Pro)",
      details: "Usa a tecnologia do Gemini mas focada estritamente nos documentos que você fornece.",
      online: true
    },
    applications: {
      education: "Organiza seus livros e textos de estudo para você tirar dúvidas.",
      business: "Analisa todos os manuais da empresa e responde o que você precisar.",
      marketing: "Organiza suas pesquisas de mercado e ideias de marcas.",
      programming: "Ajuda a estudar manuais técnicos muito longos.",
      design: "Guarda todas as suas referências de estilo em um caderno digital.",
      personal: "Organiza documentos de família, saúde ou papéis de viagens."
    },
    versions: {
      free: "Atualmente é 100% gratuito (é um projeto experimental do Google).",
      paid: "Ainda não existe uma versão paga deste serviço."
    },
    limits: "Você pode ter até 50 'cadernos' (projetos) com 50 arquivos cada.",
    strengths: [
      "Foco total nos SEUS dados (sem alucinar com a web)",
      "Geração de áudio tipo podcast impressionante",
      "Citações diretas dos seus documentos"
    ],
    limitations: [
      "Não tem conhecimento geral da web (só o que você der)",
      "Interface pode ser confusa para iniciantes",
      "Limite de fontes por caderno"
    ],
    bestFor: "Estudo e análise de documentos próprios"
  },
  {
    id: "bolt-new",
    name: "Bolt.new",
    company: "StackBlitz",
    category: "Pesquisa",
    type: "Programação / Criar Sites / Rapidês",
    mainFunction: "Cria aplicativos e sites inteiros direto no seu navegador. Você fala o que quer e ele constrói o sistema pronto para usar.",
    howToUse: "Acesse bolt.new e descreva o site que você quer. Ele vai criar o código, instalar tudo e te mostrar o resultado na hora.",
    secondaryFunctions: [
      "Criação de sites profissionais em minutos",
      "Edição de código em tempo real",
      "Instalação automática de bibliotecas",
      "Visualização ao vivo do seu projeto",
      "Exportação para o GitHub",
      "Correção de erros automática"
    ],
    multimodal: {
      text: true,
      image: false,
      audio: false,
      video: false,
      files: true,
      pdf: false,
      details: "Focado em entender seus pedidos de criação de software e transformar em código que funciona."
    },
    interface: {
      format: "Editor de Código + Preview",
      complexity: "Média",
      details: "Interface que divide a tela entre o que você pede e o site sendo construído."
    },
    technology: {
      modelType: "IA Generativa de Código (WebContainers)",
      details: "Usa tecnologia que roda um servidor inteiro dentro do seu Google Chrome.",
      online: true
    },
    applications: {
      education: "Ajuda a criar protótipos de projetos de faculdade.",
      business: "Cria páginas de vendas e sistemas internos rapidinho.",
      marketing: "Ótimo para criar landing pages de campanhas.",
      programming: "Acelera a criação do início de qualquer aplicativo.",
      design: "Transforma ideias visuais em sites reais.",
      personal: "Cria portfólios e sites de eventos pessoais."
    },
    versions: {
      free: "Permite criar projetos básicos com limites de uso diário.",
      paid: "Uso ilimitado, projetos privados e acesso a modelos de IA mais potentes."
    },
    limits: "Tem um número de 'créditos' que você gasta por dia ao gerar código.",
    strengths: [
      "Rapidez absurda (site pronto em segundos)",
      "Não precisa instalar nada no PC",
      "O site já sai funcionando de verdade"
    ],
    limitations: [
      "Limitado a tecnologias web",
      "Projetos muito grandes podem ser lentos",
      "Requer algum conhecimento básico para ajustar detalhes"
    ],
    bestFor: "Criar protótipos e sites completos rapidamente"
  },
  {
    id: "v0-dev",
    name: "v0.dev",
    company: "Vercel",
    category: "Pesquisa",
    type: "Design / Programação / Interfaces",
    mainFunction: "O gênio do design para sites. Você manda uma foto de um site ou descreve um visual, e ele cria o código da interface perfeito.",
    howToUse: "Acesse v0.dev. Você pode desenhar num papel, tirar foto e mandar pra ele transformar em site.",
    secondaryFunctions: [
      "Transformar fotos de rascunhos em sites",
      "Criação de componentes bonitos (React/Tailwind)",
      "Sugestão de cores e fontes para marcas",
      "Geração de código pronto para copiar e colar",
      "Variantes de design para o mesmo pedido",
      "Refinamento de interfaces existentes"
    ],
    multimodal: {
      text: true,
      image: true,
      audio: false,
      video: false,
      files: true,
      pdf: false,
      details: "Especialista em 'olhar' para imagens e transformá-las em código visual de alta qualidade."
    },
    interface: {
      format: "Chat + Galeria Visual",
      complexity: "Fácil",
      details: "Muito visual e direto ao ponto, focado em beleza e usabilidade."
    },
    technology: {
      modelType: "IA de Visão e Código",
      details: "Treinado especificamente nas melhores práticas de design moderno.",
      online: true
    },
    applications: {
      education: "Excelente para estudar como interfaces modernas são construídas.",
      business: "Cria painéis de controle e dashboards profissionais.",
      marketing: "Gera visuais de banners e seções de sites chamativas.",
      programming: "Economiza horas de escrita de código visual (CSS/Tailwind).",
      design: "Ponte perfeita entre o desenho artístico e o código real.",
      personal: "Cria visual do seu blog ou site pessoal com cara de app famoso."
    },
    versions: {
      free: "Créditos limitados para gerar designs básicos todos os meses.",
      paid: "Geração rápida, mais créditos e modo privado para seus designs."
    },
    limits: "Você ganha créditos que renovam, mas projetos complexos gastam mais créditos.",
    strengths: [
      "Qualidade visual impressionante",
      "Código limpo e fácil de mexer",
      "Entende rascunhos feitos à mão"
    ],
    limitations: [
      "Focado na 'casca' (visual), não na lógica complexa",
      "Melhor performance em Inglês",
      "Depende do ecossistema da Vercel para facilidade máxima"
    ],
    bestFor: "Criar interfaces bonitas e componentes modernos"
  },
  {
    id: "gamma",
    name: "Gamma IA",
    company: "Gamma Tech",
    category: "Pesquisa",
    type: "Apresentações / Sites / Documentos",
    mainFunction: "Cria apresentações de slides inteiras ou sites de uma página só de você dizer o tema.",
    howToUse: "Acesse gamma.app. Escolha 'Nova apresentação' e escreva o assunto. Ele monta os slides, coloca imagens e escolhe as cores sozinho.",
    secondaryFunctions: [
      "Criação de slides profissionais",
      "Criação de landing pages",
      "Transformar textos em apresentações",
      "Edição visual fácil com arrastar e soltar",
      "Escolha inteligente de imagens e ícones",
      "Compartilhamento via link ou PDF"
    ],
    multimodal: {
      text: true,
      image: true,
      audio: false,
      video: false,
      files: true,
      pdf: true,
      details: "Mestre em transformar ideias abstratas em layouts organizados e visualmente bonitos."
    },
    interface: {
      format: "Editor de Slides Inteligente",
      complexity: "Muito Fácil",
      details: "Não parece o PowerPoint antigo; é moderno, fluido e muito intuitivo."
    },
    technology: {
      modelType: "IA de Layout e Conteúdo",
      details: "Combina escrita com design inteligente que se ajusta sozinho.",
      online: true
    },
    applications: {
      education: "Criar apresentações de trabalhos escolares em 1 minuto.",
      business: "Montar propostas comerciais e apresentações para investidores.",
      marketing: "Criar páginas simples para lançar produtos ou eventos.",
      programming: "Não é o foco dele.",
      design: "Boa base para quem não sabe por onde começar um layout.",
      personal: "Criar convites interativos ou álbuns digitais."
    },
    versions: {
      free: "Você ganha créditos iniciais para criar algumas apresentações grátis.",
      paid: "Uso ilimitado, remoção da marca deles e exportação em alta qualidade."
    },
    limits: "Funciona por sistema de créditos. Acabou o crédito, precisa esperar ou assinar.",
    strengths: [
      "Velocidade incrível para gerar conteúdo pronto",
      "Design moderno e limpo por padrão",
      "Flexibilidade entre slide e página web"
    ],
    limitations: [
      "Difícil de customizar detalhes muito específicos",
      "Custo por crédito pode ser alto no longo prazo",
      "Depende de conexão estável"
    ],
    bestFor: "Apresentações rápidas e páginas de impacto"
  },
  {
    id: "cursor",
    name: "Cursor",
    company: "Anysphere",
    category: "Pesquisa",
    type: "Programação / Editor de Código / Inteligente",
    mainFunction: "O editor de código que parece o VS Code, mas é feito inteiramente com IA para programar por você.",
    howToUse: "Baixe o aplicativo Cursor, importe seu projeto e use 'Ctrl+K' para pedir para a IA escrever ou arrumar o código.",
    secondaryFunctions: [
      "Chat que conhece todo o seu projeto",
      "Previsão da próxima edição (Tab to Autocomplete)",
      "Arrumar erros de terminal automaticamente",
      "Reescrever arquivos inteiros com um comando",
      "Busca inteligente de funções no código",
      "Suporte a modelos como Claude 3.5 e GPT-4o"
    ],
    multimodal: {
      text: true,
      image: false,
      audio: false,
      video: false,
      files: true,
      pdf: false,
      details: "Especialista em ler centenas de arquivos de código ao mesmo tempo para entender seu sistema."
    },
    interface: {
      format: "Editor de Código Profissional",
      complexity: "Difícil (para programadores)",
      details: "É uma cópia do VS Code, então quem já programa vai se sentir em casa."
    },
    technology: {
      modelType: "LLM + RAG de Código",
      details: "Mapeia seu projeto inteiro para as respostas fazerem sentido no seu contexto.",
      online: true
    },
    applications: {
      education: "A melhor ferramenta para quem está aprendendo a programar hoje.",
      business: "Aumenta muito a produtividade da equipe de tecnologia.",
      marketing: "Não ajuda muito nessa parte.",
      programming: "Atualmente é considerada a melhor ferramenta de IA para programadores.",
      design: "Ajuda a criar o visual do site usando código.",
      personal: "Cria automações para seu computador de forma fácil."
    },
    versions: {
      free: "Uso limitado do chat e modelos potentes todos os meses.",
      paid: "Uso ilimitado, acesso aos melhores modelos e mais velocidade."
    },
    limits: "No plano grátis, você tem um limite de 'solicitações premium' por mês.",
    strengths: [
      "Conhece seu projeto inteiro (não precisa colar código)",
      "Previsão de código super precisa",
      "Permite escolher qual IA você quer usar (Claude ou GPT)"
    ],
    limitations: [
      "Pode ser intimidador para quem não é da área",
      "Consome muita memória do computador",
      "Assinatura em dólar"
    ],
    bestFor: "Programadores profissionais e estudantes de TI"
  }
];
