# NOMAD — Área do Cliente

Portal web para clientes da agência NOMAD acompanharem o trabalho sendo feito. Construído com React + Vite + Tailwind.

## Rodando

```bash
npm install
npm run dev
```

Aplicação sobe em `http://localhost:5173`.

## Stack

- **React 18** + **Vite**
- **Tailwind CSS** (design system NOMAD customizado)
- **Recharts** (gráficos de linha, barras, pizza e sparklines)
- **Lucide React** (ícones)
- **React Router** (navegação)
- **LocalStorage** (persistência — sem backend)

## Páginas

1. **Visão Geral** — Dashboard com KPIs, evolução de 3 meses, status do mês, atividades recentes e próximos entregáveis.
2. **Plano de Marketing** — Timeline trimestral M1/M2/M3, posicionamento, público-alvo e pizza de verba por canal.
3. **Planos de Ação** — CRUD completo com filtros por status e prioridade.
4. **Resultados do Mês** — Seletor de mês, KPIs com comparativo Meta x Realizado, análise do CS, conquistas e próximos passos. Exportação print-friendly.
5. **Campanhas Ativas** — Lista com sparklines, filtros por canal e status.
6. **Reuniões & Comunicados** — Timeline cronológica, comunicados e formulário de solicitação.
7. **Documentos** — Biblioteca organizada por categoria com busca e upload simulado.
8. **Calendário de Conteúdo** — Grid mensal navegável com fluxo completo de aprovação (drawer lateral, histórico, aprovação em lote, visão em lista).

## Dados Mockados

No primeiro carregamento, o `localStorage` é populado com dados realistas da **Clínica Estética Bella**:

- ROAS 4.8x, R$ 5.000/mês de investimento, 142 leads, CPL R$ 35,21
- 3 campanhas ativas (Meta, Google, TikTok) + 1 pausada
- 3 planos de ação (2 em execução + 1 concluído)
- 20 posts no calendário do mês (8 aprovados, 5 aguardando, 2 reprovados com feedback, 3 publicados, 2 rascunhos)
- 2 reuniões registradas + comunicados da agência
- 8 documentos em 5 categorias

Há 3 clientes mockados para testar a troca de contexto (dropdown no header).

## Reset de dados

O botão de refresh no header restaura o seed inicial.
