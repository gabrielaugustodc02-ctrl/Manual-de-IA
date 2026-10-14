import { GoogleGenAI } from "@google/genai";

/**
 * Motor Inteligente de Síntese de Prompts (Offline & Online).
 * Garante que o AprendAI funcione 100% no GitHub Pages sem depender de servidor,
 * utilizando técnicas consagradas de Engenharia de Prompts (Role, Context, Goal, Constraints, Output).
 */

export interface PromptSynthesisOptions {
  customApiKey?: string;
}

export async function generateEnhancedPrompt(
  userInput: string,
  options: PromptSynthesisOptions = {}
): Promise<{ text: string; source: 'gemini' | 'local' }> {
  const cleanInput = userInput.trim();
  if (!cleanInput) {
    throw new Error('O comando não pode estar vazio.');
  }

  // 1. Tentar obter chave de API da Gemini (localStorage, vite env, ou process.env)
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
  const envKey = 
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    ((import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined);
  
  const apiKey = (options.customApiKey || storedKey || envKey || '').trim();

  // Se houver chave válida, tentar chamar a Gemini API
  if (apiKey && apiKey.length > 10) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Transforme esta solicitação do usuário em um prompt profissional de altíssimo nível para IA: "${cleanInput}"`,
        config: {
          systemInstruction: 
            "Você é o AprendAI, o arquiteto de prompts do Manual Técnico de Inteligência Artificial. " +
            "Sua missão é transformar qualquer pedido do usuário em um PROMPT DE ELITE, estruturado, objetivo e poderoso. " +
            "Formate a resposta em Markdown usando as seções: " +
            "## 🎯 Papel da IA\n" +
            "## 📋 Objetivo Principal\n" +
            "## 🛠️ Instruções Passo a Passo\n" +
            "## 🎨 Tom de Voz & Estilo\n" +
            "## 🚫 O que Evitar\n" +
            "## 📌 Início Sugerido da Resposta\n" +
            "NÃO inclua saudações, introduções ou conversas antes ou depois. Gere exclusivamente o comando pronto para copiar.",
        },
      });

      const generated = response.text?.trim();
      if (generated && generated.length > 20) {
        return { text: generated, source: 'gemini' };
      }
    } catch (err) {
      console.warn('Gemini API falhou ou está indisponível neste ambiente (GitHub Pages). Usando gerador local avançado.', err);
      // Fallback suave e transparente para o motor local
    }
  }

  // 2. Motor Local de Engenharia de Prompts (Funciona em qualquer ambiente estático)
  // Simula um delay natural de processamento para UX fluida
  await new Promise(resolve => setTimeout(resolve, 350));
  const localPrompt = synthesizePromptLocally(cleanInput);
  return { text: localPrompt, source: 'local' };
}

/**
 * Analisador semântico de intenções para sintetizar prompts estruturados em português
 */
function synthesizePromptLocally(input: string): string {
  const lower = input.toLowerCase();

  // Detectores de intenção
  const isCode = /código|programar|python|javascript|typescript|react|html|css|bug|função|api|banco|sql|script/i.test(lower);
  const isImage = /imagem|desenho|foto|ilustração|render|3d|arte|banner|design/i.test(lower);
  const isEmailOrLetter = /email|e-mail|carta|mensagem|agradecimento|pedido|folga|demissão|cobrança|convite/i.test(lower);
  const isSummaryOrStudy = /resumo|resumir|explicar|estudo|conteúdo|artigo|livro|história|biologia|física|química|matemática|como funciona/i.test(lower);
  const isScriptOrCreative = /roteiro|vídeo|reels|tiktok|youtube|ideias|ideia|criativo|slogan|história|post|instagram/i.test(lower);
  const isSeniorFriendly = /idoso|melhor idade|simples|vovô|vovó|fácil de entender|leigo|didático/i.test(lower);
  const isBusinessOrMarketing = /negócio|empresa|vendas|marketing|plano|estratégia|cliente|produto|preço/i.test(lower);

  let role = "Especialista e Consultor Sênior";
  let objective = `Executar com maestria a tarefa: "${input}"`;
  let steps: string[] = [];
  let tone = "Claro, profissional, objetivo e altamente didático";
  let avoid = "Respostas genéricas, clichês vagos, termos incompreensíveis sem explicação e enrolação.";
  let outputFormat = "Texto estruturado em tópicos com marcadores claros e destaques em negrito.";

  if (isCode) {
    role = "Engenheiro de Software Sênior e Especialista em Clean Code";
    objective = `Desenvolver uma solução em código limpa, performática e documentada para: "${input}"`;
    steps = [
      "1. Apresente o código completo, funcional e devidamente comentado.",
      "2. Utilize as melhores práticas da linguagem (tratamento de erros, tipagem e boas convenções).",
      "3. Explique de forma sucinta como instalar dependências e como testar o código.",
      "4. Aponte considerações de performance e casos de borda importantes."
    ];
    tone = "Técnico, preciso, direto ao ponto e focado em código prático";
    avoid = "Códigos incompletos com reticências '...', dependências depreciadas ou explicações longas antes do bloco de código.";
    outputFormat = "Bloco de código formatado (Markdown com syntax highlighting) seguido de guia rápido de uso.";
  } else if (isImage) {
    role = "Diretor de Arte e Especialista em Engenharia de Prompts para Midjourney / Imagen 3 / DALL-E";
    objective = `Criar a descrição visual hiperdetalhada para gerar uma imagem fotográfica ou artística de: "${input}"`;
    steps = [
      "1. Defina o sujeito principal com detalhes visuais ricos (textura, expressão, pose e vestimentas).",
      "2. Especifique a iluminação (ex: luz volumétrica dourada, iluminação cinematográfica, neon cyberpunk ou estúdio).",
      "3. Descreva a composição de câmera (ex: ângulo 85mm portrait, profundidade de campo rasa, resolução 8k, f/1.8).",
      "4. Forneça o prompt tanto em Português quanto em Inglês (ideal para geradores globais)."
    ];
    tone = "Visual, descritivo, sensorial e cinematográfico";
    avoid = "Termos abstratos sem correspondente visual, marcas d'água, ruído ou deformações anatômicas.";
    outputFormat = "Prompt principal em inglês, seguido de variações de estilo e parâmetros recomendados (--ar 16:9, etc.).";
  } else if (isEmailOrLetter) {
    role = "Especialista em Comunicação Corporativa e Redação Persuasiva";
    objective = `Redigir uma comunicação impecável e eficiente para atender ao pedido: "${input}"`;
    steps = [
      "1. Crie 3 opções de assunto impactantes e diretos.",
      "2. Escreva o corpo da mensagem com saudação cordial, contexto objetivo e chamada para ação (CTA) clara.",
      "3. Insira marcadores [Coloque aqui seu dado] para fácil personalização.",
      "4. Adicione uma versão formal e uma versão leve/descontraída para escolha."
    ];
    tone = "Cortês, assertivo, polido e transparente";
    avoid = "Frases excessivamente longas, prolixidade, agressividade passiva ou tom informal inadequado.";
    outputFormat = "Modelo pronto para copiar e colar com campos editáveis sinalizados entre colchetes.";
  } else if (isScriptOrCreative) {
    role = "Roteirista Chefe e Estrategista de Mídias Digitais Virais";
    objective = `Produzir um roteiro envolvente e de alta retenção baseado no tema: "${input}"`;
    steps = [
      "1. Gancho Inicial (0 a 3s): Crie uma frase de abertura magnética que prenda a atenção imediatamente.",
      "2. Desenvolvimento (3 a 45s): Divida a mensagem em 3 pontos fortes e dinâmicos, com indicações de cortes visuais.",
      "3. Clímax e Conclusão: Entregue a principal dica prática ou reflexão de valor.",
      "4. Chamada para Ação (CTA): Instrua a audiência a comentar, salvar ou seguir com um motivo genuíno."
    ];
    tone = "Energético, magnético, conversacional e moderno";
    avoid = "Introduções lentas ('Oi pessoal, tudo bem?'), clichês batidos e conclusões sem chamada clara.";
    outputFormat = "Tabela ou roteiro em 2 colunas: [ÁUDIO/FALA] e [VÍDEO/O QUE APARECE NA TELA].";
  } else if (isSeniorFriendly) {
    role = "Educador Paciente e Especialista em Didática Acessível para Todas as Idades";
    objective = `Explicar com extrema clareza, empatia e sem termos difíceis: "${input}"`;
    steps = [
      "1. Use uma analogia do cotidiano (como fazer um bolo, enviar uma carta ou ir ao mercado) para ilustrar o conceito.",
      "2. Explique em frases curtas com vocabulário simples e afetuoso.",
      "3. Destaque um passo a passo numerado de 'Como fazer' ou 'O que lembrar'.",
      "4. Finalize com uma dica prática de segurança ou tranquilidade."
    ];
    tone = "Acolhedor, paciente, descomplicado e seguro";
    avoid = "Jargões técnicos em inglês, siglas complicadas sem tradução e explicações abstratas.";
    outputFormat = "Texto com fonte imaginária grande, parágrafos curtos e analogias visuais.";
  } else if (isSummaryOrStudy) {
    role = "Professor Universitário e Mestre em Métodos Ativos de Aprendizagem";
    objective = `Estruturar um guia de estudos e resumo aprofundado sobre: "${input}"`;
    steps = [
      "1. Resumo Executivo em 3 frases explicando o que é e por que importa.",
      "2. Os 5 conceitos fundamentais que todo estudante precisa dominar.",
      "3. Exemplos práticos do mundo real aplicando este conhecimento.",
      "4. 3 perguntas reflexivas ou desafios rápidos com gabarito comentado para testar o aprendizado."
    ];
    tone = "Didático, estimulante, rigoroso nos fatos e envolvente";
    avoid = "Alucinações factuais, generalismos e informações sem contexto histórico ou científico.";
    outputFormat = "Guia modular dividido por seções temáticas, mapas mentais textuais e glossário de termos.";
  } else if (isBusinessOrMarketing) {
    role = "Consultor Estratégico de Negócios e Growth Hacker";
    objective = `Desenvolver um plano de ação tático e executável para: "${input}"`;
    steps = [
      "1. Diagnóstico do cenário e público-alvo prioritário.",
      "2. Proposta de Valor única e diferenciais competitivos.",
      "3. Plano de Ação em 30-60-90 dias com métricas (KPIs) recomendadas.",
      "4. Análise de riscos principais e medidas de mitigação."
    ];
    tone = "Estratégico, focado em métricas, pragmático e persuasivo";
    avoid = "Teorias sem aplicabilidade prática, estimativas irreais e propostas genéricas de 'fazer propaganda'.";
    outputFormat = "Plano tático com matriz de priorização e passos imediatos de execução.";
  } else {
    // Caso Geral
    role = "Especialista Sênior em Resolução de Problemas e Consultoria Criativa";
    objective = `Atender de forma completa e profunda à demanda: "${input}"`;
    steps = [
      "1. Forneça uma resposta detalhada, estruturada e de fácil implementação.",
      "2. Divida a resolução em etapas sequenciais com exemplos práticos.",
      "3. Apresente alternativas e sugestões de melhoria para o usuário.",
      "4. Finalize com um resumo dos próximos passos recomendados."
    ];
    tone = "Profissional, acolhedor, assertivo e completo";
    avoid = "Respostas curtas demais que exijam mais perguntas, ou conteúdo vago sem utilidade prática.";
    outputFormat = "Resposta em formato de tópicos com marcadores, destaques e dicas finais.";
  }

  return [
    `# 🤖 Comando Estruturado para IA (Copie e Cole)`,
    ``,
    `> **Instrução:** Copie todo o texto abaixo e cole no **ChatGPT, Gemini, Claude ou Copilot**.`,
    ``,
    `---`,
    ``,
    `## 🎯 [Papel da IA]`,
    `Aja como um **${role}**.`,
    ``,
    `## 📋 [Objetivo Principal]`,
    `${objective}`,
    ``,
    `## 🛠️ [Instruções Passo a Passo]`,
    ...steps.map(s => `- ${s}`),
    ``,
    `## 🎨 [Tom de Voz & Estilo]`,
    `- **Tom:** ${tone}.`,
    `- **Formato Esperado:** ${outputFormat}.`,
    `- Idioma: Português do Brasil impecável.`,
    ``,
    `## 🚫 [Restrições]`,
    `- ${avoid}`,
    `- Não invente dados não confirmados; se algo for incerto, aponte com clareza.`,
    ``,
    `## 🚀 [Comece Agora]`,
    `Responda confirmando que entendeu o papel e apresente imediatamente a solução estruturada.`,
  ].join('\n');
}
