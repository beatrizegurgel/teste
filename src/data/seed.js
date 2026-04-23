// Seed inicial de dados mockados para o NOMAD Portal
// Persistido em localStorage na primeira execução

const today = new Date()
const year = today.getFullYear()
const month = today.getMonth() // 0-indexed

const dateAt = (y, m, d) => new Date(y, m, d).toISOString()
const monthLabel = (offset = 0) => {
  const d = new Date(year, month + offset, 1)
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

// ----------- POSTS DO CALENDÁRIO -----------
// 20 posts: 8 aprovados, 5 aguardando, 2 reprovados, 3 publicados, 2 rascunhos
// Formatos: 6 reels, 7 feed, 4 carrossel, 3 stories
const buildPosts = () => {
  const posts = [
    // APROVADOS (8)
    { day: 2, format: 'Reels', status: 'aprovado', caption: 'Conheça nosso novo protocolo de Limpeza de Pele Profunda! Resultado visível desde a primeira sessão. ✨', mediaUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400' },
    { day: 4, format: 'Feed', status: 'aprovado', caption: 'Antes e depois: tratamento de manchas com peeling químico. Agende sua avaliação gratuita! 💛', mediaUrl: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400' },
    { day: 6, format: 'Carrossel', status: 'aprovado', caption: '5 mitos sobre botox que você precisa parar de acreditar. Arrasta para o lado! ➡️', mediaUrl: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400' },
    { day: 8, format: 'Stories', status: 'aprovado', caption: 'Promoção relâmpago: 30% OFF em Drenagem Linfática hoje! 🔥', mediaUrl: '' },
    { day: 10, format: 'Reels', status: 'aprovado', caption: 'Bastidores da clínica: conheça nossa equipe especializada em harmonização facial! 👩‍⚕️', mediaUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400' },
    { day: 13, format: 'Feed', status: 'aprovado', caption: 'Skincare matinal em 5 passos para uma pele radiante. Salva esse post! 📌', mediaUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400' },
    { day: 15, format: 'Carrossel', status: 'aprovado', caption: 'Tudo sobre o tratamento de Microagulhamento — benefícios, indicações e cuidados pós-procedimento.', mediaUrl: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400' },
    { day: 17, format: 'Feed', status: 'aprovado', caption: 'Depoimento real da Mariana: "Minha autoestima mudou completamente após o tratamento." 💛', mediaUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },

    // AGUARDANDO APROVAÇÃO (5)
    { day: 19, format: 'Reels', status: 'aguardando', caption: 'Tour pela clínica: ambiente acolhedor, equipamentos de última geração e atendimento humanizado.', mediaUrl: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=400' },
    { day: 20, format: 'Feed', status: 'aguardando', caption: 'Você sabe qual o melhor tratamento para sua pele? Faça nosso quiz no link da bio!', mediaUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400' },
    { day: 22, format: 'Carrossel', status: 'aguardando', caption: 'Guia completo do Lifting Facial sem cirurgia — tecnologias, resultados e quem pode fazer.', mediaUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400' },
    { day: 24, format: 'Reels', status: 'aguardando', caption: 'Procedimento de criolipólise em ação! Veja como funciona essa tecnologia revolucionária.', mediaUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400' },
    { day: 26, format: 'Stories', status: 'aguardando', caption: 'Enquete: qual seu maior incômodo estético? Vem responder!', mediaUrl: '' },

    // REPROVADOS (2)
    { day: 11, format: 'Feed', status: 'reprovado', caption: 'Black Friday começou! Descontos imperdíveis em todos os procedimentos.', mediaUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400', clientFeedback: 'A arte ficou muito poluída visualmente, e o desconto anunciado (50%) está errado — o correto seria 30%. Por favor, refazer com identidade visual mais clean e ajustar o número.' },
    { day: 28, format: 'Carrossel', status: 'reprovado', caption: 'Conheça os 10 procedimentos mais procurados em 2026', mediaUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', clientFeedback: 'Faltou incluir o procedimento de bioestimulador, que é nosso carro-chefe. Pode adicionar e reenviar?' },

    // PUBLICADOS (3) - dias passados
    { day: 1, format: 'Reels', status: 'publicado', caption: 'Bem-vindos ao nosso perfil renovado! Aqui você encontra dicas, novidades e muito mais. 💛', mediaUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400' },
    { day: 3, format: 'Feed', status: 'publicado', caption: 'Cuidados pós-preenchimento labial: o que fazer e o que evitar nos primeiros dias.', mediaUrl: 'https://images.unsplash.com/photo-1522337094846-8a818192de1f?w=400' },
    { day: 5, format: 'Stories', status: 'publicado', caption: 'Hoje a Dra. Camila está respondendo dúvidas no direct! 📩', mediaUrl: '' },

    // RASCUNHOS (2)
    { day: 29, format: 'Reels', status: 'rascunho', caption: 'Roteiro: tendências de estética para o verão', mediaUrl: '' },
    { day: 30, format: 'Feed', status: 'rascunho', caption: 'Em construção — divulgação do novo serviço de massoterapia', mediaUrl: '' },
  ]

  return posts.map((p, idx) => {
    const scheduledAt = dateAt(year, month, p.day)
    const baseHistory = [
      { type: 'enviado', author: 'NOMAD', message: 'Post enviado pela agência para aprovação.', date: dateAt(year, month, Math.max(1, p.day - 3)) },
    ]

    let history = baseHistory
    if (p.status === 'aprovado') {
      history = [
        ...baseHistory,
        { type: 'aprovado', author: 'Cliente', message: 'Post aprovado pelo cliente.', date: dateAt(year, month, Math.max(1, p.day - 2)) },
      ]
    } else if (p.status === 'publicado') {
      history = [
        ...baseHistory,
        { type: 'aprovado', author: 'Cliente', message: 'Post aprovado pelo cliente.', date: dateAt(year, month, Math.max(1, p.day - 2)) },
        { type: 'publicado', author: 'NOMAD', message: 'Post publicado nas redes sociais.', date: scheduledAt },
      ]
    } else if (p.status === 'reprovado' && idx === 11) {
      // post reprovado #1 com histórico completo de 3 interações
      history = [
        { type: 'enviado', author: 'NOMAD', message: 'Primeira versão enviada para aprovação.', date: dateAt(year, month, Math.max(1, p.day - 5)) },
        { type: 'reprovado', author: 'Cliente', message: 'Reprovado: arte muito poluída e desconto errado.', date: dateAt(year, month, Math.max(1, p.day - 4)) },
        { type: 'enviado', author: 'NOMAD', message: 'Segunda versão enviada com ajustes solicitados.', date: dateAt(year, month, Math.max(1, p.day - 2)) },
        { type: 'reprovado', author: 'Cliente', message: p.clientFeedback, date: dateAt(year, month, Math.max(1, p.day - 1)) },
      ]
    } else if (p.status === 'reprovado') {
      history = [
        ...baseHistory,
        { type: 'reprovado', author: 'Cliente', message: p.clientFeedback, date: dateAt(year, month, Math.max(1, p.day - 1)) },
      ]
    }

    return {
      id: `post-${idx + 1}`,
      clientId: 'clinica-bella',
      format: p.format,
      status: p.status,
      caption: p.caption,
      mediaUrl: p.mediaUrl,
      scheduledAt,
      scheduledTime: ['09:00', '12:00', '15:00', '18:00', '20:00'][idx % 5],
      creativeLink: p.mediaUrl ? p.mediaUrl : '',
      clientFeedback: p.clientFeedback || '',
      history,
    }
  })
}

// ----------- CLIENTES -----------
export const clients = [
  {
    id: 'clinica-bella',
    name: 'Clínica Estética Bella',
    niche: 'Estética / Saúde',
    csManager: 'Juliana Andrade',
    monthInvestment: 5000,
    avgRoas: 4.8,
    leads: 142,
    cpl: 35.21,
    monthStatus: 'no_prazo', // no_prazo | atencao | em_atraso
  },
  {
    id: 'restaurante-fogo',
    name: 'Restaurante Fogo & Brasa',
    niche: 'Gastronomia',
    csManager: 'Rafael Mendes',
    monthInvestment: 3500,
    avgRoas: 3.6,
    leads: 89,
    cpl: 39.32,
    monthStatus: 'atencao',
  },
  {
    id: 'studio-moda',
    name: 'Studio Moda Boutique',
    niche: 'Varejo / Moda',
    csManager: 'Beatriz Lima',
    monthInvestment: 7200,
    avgRoas: 5.4,
    leads: 215,
    cpl: 33.48,
    monthStatus: 'no_prazo',
  },
]

// ----------- DASHBOARD: evolução de 3 meses -----------
export const evolutionData = [
  { mes: monthLabel(-2).split(' ')[0], leads: 98, investimento: 4500, roas: 3.9, faturamento: 17550 },
  { mes: monthLabel(-1).split(' ')[0], leads: 124, investimento: 4800, roas: 4.5, faturamento: 21600 },
  { mes: monthLabel(0).split(' ')[0], leads: 142, investimento: 5000, roas: 4.8, faturamento: 24000 },
]

// ----------- ATIVIDADES RECENTES -----------
export const recentActivities = [
  { id: 'act-1', date: dateAt(year, month, Math.max(1, today.getDate() - 1)), title: 'Novo plano de ação criado', description: 'Otimização da campanha de Botox no Meta Ads', icon: 'plus' },
  { id: 'act-2', date: dateAt(year, month, Math.max(1, today.getDate() - 2)), title: '5 posts aprovados pelo cliente', description: 'Conteúdos da semana liberados para publicação', icon: 'check' },
  { id: 'act-3', date: dateAt(year, month, Math.max(1, today.getDate() - 3)), title: 'Reunião de Review Mensal realizada', description: 'Análise de resultados e definição de próximos passos', icon: 'video' },
  { id: 'act-4', date: dateAt(year, month, Math.max(1, today.getDate() - 5)), title: 'Campanha de Remarketing pausada', description: 'Pausada para ajustes de criativos', icon: 'pause' },
  { id: 'act-5', date: dateAt(year, month, Math.max(1, today.getDate() - 7)), title: 'Novo relatório mensal disponível', description: 'Confira os resultados de ' + monthLabel(-1), icon: 'file' },
]

// ----------- PRÓXIMOS ENTREGÁVEIS -----------
export const upcomingDeliverables = [
  { id: 'del-1', date: dateAt(year, month, today.getDate() + 2), title: 'Reunião de Alinhamento Quinzenal', type: 'Reunião' },
  { id: 'del-2', date: dateAt(year, month, today.getDate() + 5), title: 'Lote de criativos para Black Friday', type: 'Criativo' },
  { id: 'del-3', date: dateAt(year, month, today.getDate() + 9), title: 'Relatório quinzenal de performance', type: 'Relatório' },
  { id: 'del-4', date: dateAt(year, month, today.getDate() + 12), title: 'Lançamento da nova campanha de Verão', type: 'Campanha' },
]

// ----------- PLANO DE MARKETING DO TRIMESTRE -----------
export const marketingPlan = {
  posicionamento: 'Clínica de estética premium e humanizada, referência regional em harmonização facial e tratamentos de pele com tecnologia de ponta.',
  publicoAlvo: 'Mulheres de 28 a 55 anos, classes A e B, residentes em região metropolitana, que buscam autocuidado, autoestima e resultados naturais.',
  trimestreAtual: 'Q' + (Math.floor(month / 3) + 1) + ' / ' + year,
  mesAtual: 2,
  totalMeses: 3,
  budgetByChannel: [
    { name: 'Meta Ads', value: 2800, color: '#1877F2' },
    { name: 'Google Ads', value: 1500, color: '#4285F4' },
    { name: 'Remarketing', value: 500, color: '#F5C842' },
    { name: 'Influenciadores', value: 200, color: '#E91E63' },
  ],
  meses: [
    {
      mes: 'M1',
      titulo: monthLabel(-1),
      objetivo: 'Awareness e geração de leads para tratamentos faciais',
      canais: ['Meta Ads', 'Google Ads', 'Instagram Orgânico'],
      campanhas: ['Lançamento Limpeza de Pele', 'Tráfego Frio Botox', 'Remarketing Site'],
      meta: '120 leads / ROAS 4x',
      status: 'concluido',
    },
    {
      mes: 'M2',
      titulo: monthLabel(0),
      objetivo: 'Conversão e fidelização — campanhas de retorno e indicação',
      canais: ['Meta Ads', 'Google Ads', 'Email Marketing', 'Influenciadores'],
      campanhas: ['Indique e Ganhe', 'Pacote Verão', 'Remarketing Quente'],
      meta: '150 leads / ROAS 4.5x',
      status: 'em_execucao',
    },
    {
      mes: 'M3',
      titulo: monthLabel(1),
      objetivo: 'Black Friday e fechamento do trimestre com pico de vendas',
      canais: ['Meta Ads', 'Google Ads', 'TikTok Ads', 'Email Marketing'],
      campanhas: ['Black Friday Bella', 'Lançamento Bioestimulador', 'Última Chamada'],
      meta: '180 leads / ROAS 5x',
      status: 'planejado',
    },
  ],
}

// ----------- PLANOS DE AÇÃO -----------
export const actionPlans = [
  {
    id: 'plan-1',
    title: 'Otimização de criativos do Meta Ads',
    description: 'Testar 5 novos criativos com headlines focadas em benefício e dor. Pausar criativos com CTR < 1.2%.',
    responsible: 'Equipe de Mídia NOMAD',
    deadline: dateAt(year, month, today.getDate() + 7),
    status: 'em_execucao',
    priority: 'alta',
    progress: 60,
    createdAt: dateAt(year, month, Math.max(1, today.getDate() - 5)),
  },
  {
    id: 'plan-2',
    title: 'Implementação de funil de remarketing por etapas',
    description: 'Criar 3 etapas de remarketing: visitantes do site, vídeos assistidos 50%+ e leads não convertidos. Cada etapa com criativo específico.',
    responsible: 'Caio Pereira (Tráfego)',
    deadline: dateAt(year, month, today.getDate() + 14),
    status: 'em_execucao',
    priority: 'media',
    progress: 35,
    createdAt: dateAt(year, month, Math.max(1, today.getDate() - 3)),
  },
  {
    id: 'plan-3',
    title: 'Migração da landing page para nova versão',
    description: 'Nova LP com prova social, depoimentos em vídeo e formulário simplificado. Meta: aumentar taxa de conversão em 20%.',
    responsible: 'Equipe de Web NOMAD',
    deadline: dateAt(year, month - 1, 28),
    status: 'concluido',
    priority: 'alta',
    progress: 100,
    createdAt: dateAt(year, month - 1, 5),
  },
]

// ----------- RESULTADOS POR MÊS -----------
export const monthlyResults = {
  [`${year}-${String(month + 1).padStart(2, '0')}`]: {
    label: monthLabel(0),
    kpis: {
      investimento: { meta: 5000, realizado: 5000 },
      faturamento: { meta: 22500, realizado: 24000 },
      roas: { meta: 4.5, realizado: 4.8 },
      leads: { meta: 130, realizado: 142 },
      cpl: { meta: 38.46, realizado: 35.21 },
      conversao: { meta: 12, realizado: 14.2 },
    },
    weeklyEvolution: [
      { semana: 'Sem 1', leads: 32, investimento: 1200 },
      { semana: 'Sem 2', leads: 38, investimento: 1300 },
      { semana: 'Sem 3', leads: 41, investimento: 1300 },
      { semana: 'Sem 4', leads: 31, investimento: 1200 },
    ],
    csAnalysis: 'O mês de ' + monthLabel(0) + ' apresentou performance acima do esperado, com ROAS 6.7% acima da meta. A campanha de Limpeza de Pele continua sendo nosso destaque, gerando 48% dos leads totais. Recomendamos aumentar o budget desta campanha em 15% no próximo mês para capturar mais demanda. Também notamos uma queda de performance na campanha de Remarketing — propomos refazer os criativos com foco em prova social.',
    achievements: [
      'ROAS de 4.8x — melhor resultado dos últimos 6 meses',
      '142 leads gerados, 9.2% acima da meta mensal',
      'Taxa de conversão saltou de 12% para 14.2%',
      'Campanha de Limpeza de Pele triplicou o volume de agendamentos',
    ],
    nextSteps: [
      'Refazer criativos da campanha de Remarketing (CTR caiu 18%)',
      'Lançar campanha de Black Friday até dia 15',
      'Implementar pixel de eventos para evento "Agendamento Realizado"',
      'Realinhar copy do Google Ads para incluir benefício "primeira sessão grátis"',
    ],
  },
  [`${year}-${String(month).padStart(2, '0')}`]: {
    label: monthLabel(-1),
    kpis: {
      investimento: { meta: 4800, realizado: 4800 },
      faturamento: { meta: 19200, realizado: 21600 },
      roas: { meta: 4, realizado: 4.5 },
      leads: { meta: 110, realizado: 124 },
      cpl: { meta: 43.64, realizado: 38.71 },
      conversao: { meta: 11, realizado: 12.8 },
    },
    weeklyEvolution: [
      { semana: 'Sem 1', leads: 28, investimento: 1100 },
      { semana: 'Sem 2', leads: 32, investimento: 1300 },
      { semana: 'Sem 3', leads: 35, investimento: 1300 },
      { semana: 'Sem 4', leads: 29, investimento: 1100 },
    ],
    csAnalysis: 'Mês de transição estratégica com excelentes resultados. Conseguimos superar a meta de leads em 12% mantendo o investimento planejado.',
    achievements: [
      'Superação da meta de leads em 12%',
      'Lançamento bem-sucedido da campanha de Limpeza de Pele',
      'CPL reduzido em 11% vs mês anterior',
    ],
    nextSteps: [
      'Escalar campanha de Limpeza de Pele',
      'Iniciar testes A/B na landing page',
    ],
  },
}

// ----------- CAMPANHAS ATIVAS -----------
export const campaigns = [
  {
    id: 'camp-1',
    name: 'Limpeza de Pele - Tráfego Frio',
    channel: 'Meta',
    status: 'ativa',
    investment: 2200,
    leads: 68,
    roas: 5.2,
    spark: [12, 15, 18, 22, 19, 24, 28],
  },
  {
    id: 'camp-2',
    name: 'Botox - Search Branded',
    channel: 'Google',
    status: 'ativa',
    investment: 1500,
    leads: 42,
    roas: 4.8,
    spark: [8, 10, 9, 12, 14, 13, 15],
  },
  {
    id: 'camp-3',
    name: 'Remarketing - Visitantes',
    channel: 'Meta',
    status: 'pausada',
    investment: 800,
    leads: 22,
    roas: 3.4,
    spark: [6, 5, 7, 4, 5, 3, 2],
  },
  {
    id: 'camp-4',
    name: 'Bioestimulador - Awareness',
    channel: 'TikTok',
    status: 'ativa',
    investment: 500,
    leads: 10,
    roas: 2.8,
    spark: [2, 3, 2, 4, 5, 4, 6],
  },
]

// ----------- REUNIÕES -----------
export const meetings = [
  {
    id: 'meet-1',
    date: dateAt(year, month, Math.max(1, today.getDate() - 3)),
    type: 'Review Mensal',
    pauta: 'Análise dos resultados de ' + monthLabel(-1) + ', revisão de campanhas ativas e planejamento de Black Friday.',
    decisions: 'Aprovado aumento de 15% no budget da campanha de Limpeza de Pele. Aprovado teste de TikTok Ads. Pausa imediata da campanha de Remarketing antiga.',
    nextActions: 'NOMAD entregará novos criativos de Black Friday até 15/11. Cliente enviará lista de pacientes para campanha de indicação até dia 10.',
  },
  {
    id: 'meet-2',
    date: dateAt(year, month - 1, 15),
    type: 'Alinhamento',
    pauta: 'Definição da estratégia trimestral, posicionamento e novos canais.',
    decisions: 'Inclusão do TikTok Ads no mix de canais. Definição de meta de 450 leads para o trimestre. Lançamento de funil de email marketing.',
    nextActions: 'NOMAD enviará proposta detalhada do TikTok Ads. Cliente alinhará time interno para responder leads em até 2h.',
  },
]

// ----------- COMUNICADOS -----------
export const announcements = [
  {
    id: 'ann-1',
    date: dateAt(year, month, Math.max(1, today.getDate() - 4)),
    title: 'Atualização de política do Meta Ads',
    message: 'A Meta atualizou suas políticas de anúncios para o segmento de saúde e estética. Algumas peças podem precisar de ajustes — nossa equipe já está revisando todos os criativos ativos.',
    priority: 'alta',
  },
  {
    id: 'ann-2',
    date: dateAt(year, month, Math.max(1, today.getDate() - 10)),
    title: 'Nova ferramenta de relatórios disponível',
    message: 'A partir deste mês, você terá acesso a um dashboard interativo com dados em tempo real das campanhas. Tutorial em vídeo será enviado em breve.',
    priority: 'media',
  },
]

// ----------- DOCUMENTOS -----------
export const documents = [
  { id: 'doc-1', name: 'Plano Estratégico Q4 2026.pdf', category: 'Estratégia', uploadedAt: dateAt(year, month - 1, 5), type: 'pdf', size: '2.4 MB' },
  { id: 'doc-2', name: 'Relatório Mensal - ' + monthLabel(-1) + '.pdf', category: 'Relatórios', uploadedAt: dateAt(year, month, 3), type: 'pdf', size: '1.8 MB' },
  { id: 'doc-3', name: 'Brand Guidelines Bella.pdf', category: 'Estratégia', uploadedAt: dateAt(year, month - 2, 12), type: 'pdf', size: '5.1 MB' },
  { id: 'doc-4', name: 'Pasta de Criativos - Outubro.zip', category: 'Criativos', uploadedAt: dateAt(year, month - 1, 28), type: 'zip', size: '48.2 MB' },
  { id: 'doc-5', name: 'Contrato de Prestação de Serviços.pdf', category: 'Contratos', uploadedAt: dateAt(year, month - 3, 1), type: 'pdf', size: '850 KB' },
  { id: 'doc-6', name: 'Persona - Pacientes Bella.pdf', category: 'Estratégia', uploadedAt: dateAt(year, month - 2, 20), type: 'pdf', size: '1.2 MB' },
  { id: 'doc-7', name: 'Reels Aprovados - Outubro.zip', category: 'Criativos', uploadedAt: dateAt(year, month - 1, 25), type: 'zip', size: '120 MB' },
  { id: 'doc-8', name: 'Análise de Concorrência.pdf', category: 'Outros', uploadedAt: dateAt(year, month - 1, 10), type: 'pdf', size: '3.2 MB' },
]

// ----------- POSTS DO CALENDÁRIO -----------
export const calendarPosts = buildPosts()

// ----------- SEED INICIAL -----------
export const initialSeed = {
  selectedClientId: 'clinica-bella',
  clients,
  evolutionData,
  recentActivities,
  upcomingDeliverables,
  marketingPlan,
  actionPlans,
  monthlyResults,
  campaigns,
  meetings,
  announcements,
  documents,
  calendarPosts,
}
