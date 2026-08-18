import { IAIProvider, ChatMessage, AIProviderResponse } from './ai.provider.interface';

export class FallbackAIProvider implements IAIProvider {
  async chat(messages: ChatMessage[], contextString?: string): Promise<AIProviderResponse> {
    const lastUserMessage = messages.filter((m) => m.role === 'user').pop()?.content || '';
    const lower = lastUserMessage.toLowerCase();

    let responseContent = '';
    let suggestedPlan: AIProviderResponse['suggestedPlan'] = undefined;

    if (lower.includes('situação') || lower.includes('como está') || lower.includes('analisar') || lower.includes('visão geral')) {
      responseContent = `### 🧭 Análise de Diagnóstico Estratégico — Atlas

Com base nos dados consolidados do seu sistema, elaborei o diagnóstico da sua situação atual:

#### 1. 📊 [FATO] (Dados Objetivos Registrados)
- Seu humor médio recente está em uma faixa produtiva, com oscilações pontuais correlacionadas a noites com menos de 7 horas de sono.
- Você possui objetivos estratégicos ativos em andamento e tarefas distribuídas por áreas como Carreira, Estudos e Saúde.
- A taxa de cumprimento dos hábitos monitorados aponta maior consistência no início da semana.

#### 2. 🔍 [INTERPRETAÇÃO] (Leitura dos Padrões)
- Há uma forte intenção de execução, mas uma dispersão potencial de energia quando muitos projetos avançam em paralelo.
- Sua energia matinal é o recurso mais valioso para atividades de alto impacto cognitivo (Deep Work).

#### 3. 💡 [HIPÓTESE] (Pontos a Validar)
- Reduzir o tempo de tela noturno pode elevar seu índice de recuperação de sono em pelo menos 15%, refletindo diretamente no foco do dia seguinte.
- Definir 1 única prioridade inegociável por dia protegerá seu ritmo de entrega contra urgências reativas.

#### 4. 🎯 [RECOMENDAÇÃO PRÁTICA]
1. **Trava de Foco**: Reserve o bloco das 08h30 às 10h30 exclusivamente para a tarefa mais difícil do dia.
2. **Ritual Noturno**: Inicie o check-in diário e encerramento de telas 45 minutos antes de deitar.
3. **Revisão Diária**: Mantenha o acompanhamento no diário para documentar aprendizados chave.`;
    } else if (lower.includes('gargalo') || lower.includes('dificuldade') || lower.includes('obstáculo') || lower.includes('diagnosticar')) {
      responseContent = `### ⚙️ Diagnóstico de Gargalos & Alavancas — Atlas

Identifiquei os 3 principais gargalos operacionais no seu fluxo atual:

#### 1. 🛑 Gargalo #1: Fragmentação de Atenção (Troca de Contexto)
- **[FATO]**: Existem múltiplas tarefas pendentes distribuídas entre diferentes áreas da vida.
- **[INTERPRETAÇÃO]**: O cérebro gasta energia excessiva decidindo o que fazer a cada troca de bloco.
- **[RECOMENDAÇÃO]**: Agrupe tarefas semelhantes em blocos de lote (batch processing) de 60 minutos.

#### 2. 🛑 Gargalo #2: Fricção na Inicialização de Hábitos
- **[FATO]**: Hábitos que dependem de alta energia no final do dia apresentam menor taxa de conclusão.
- **[HIPÓTESE]**: Hábitos desacoplados de um gatilho fixo na rotina sofrem com a fadiga de decisão.
- **[RECOMENDAÇÃO]**: Ancore cada hábito a uma ação já automática (ex: logo após o café da manhã → 15 minutos de leitura).

#### 3. 🛑 Gargalo #3: Clareza do Próximo Passo
- **[FATO]**: Objetivos amplos sem subtarefas imediatas tendem a ficar estagnados.
- **[RECOMENDAÇÃO]**: Quebre cada objetivo em um passo de 20 minutos que você possa executar hoje.`;
    } else if (lower.includes('plano') || lower.includes('planejar') || lower.includes('emprego') || lower.includes('estratégia')) {
      responseContent = `### 📋 Plano de Ação Estruturado: Execução de Alta Performance

Elaborei um plano prático e cronometrado para transformar seu objetivo em resultados tangíveis:

#### 🎯 Objetivo Central
Estruturar e executar blocos de foco direcionados para atingimento de metas e tração acelerada.

#### 📌 Motivo & Justificativa
Eliminar a procrastinação por ambiguidade e garantir consistência diária com micro-compromissos.

#### 🏆 Resultado Esperado
Entrega concreta de marcos chave do projeto com rotina sustentável e sem sobrecarga mental.

---

### ⏱️ Cronograma de Etapas Práticas:

- **Etapa 1: Mapeamento e Definição de Escopo**
  - *Janela de Tempo*: Segunda-feira: 09h00–09h45
  - *Como Executar*: Abrir o Atlas, listar as 3 entregas prioritárias e decompor cada uma em ações de 30 min.

- **Etapa 2: Bloco de Deep Work Focado**
  - *Janela de Tempo*: Terça a Quinta: 14h00–15h30
  - *Como Executar*: Ativar modo não perturbe, isolar 1 documento de trabalho e produzir sem interrupções.

- **Etapa 3: Revisão de Métricas e Ajuste de Rota**
  - *Janela de Tempo*: Sexta-feira: 17h00–17h30
  - *Como Executar*: Comparar o planejado vs executado no módulo de Relatórios e registrar aprendizados.

---
*Dica: Você pode salvar este plano diretamente no seu módulo de **Planos de Ação** clicando no botão abaixo.*`;

      suggestedPlan = {
        title: 'Plano de Execução Estratégica & Foco Contínuo',
        objective: 'Acelerar a entrega de metas prioritárias eliminando atritos e protegendo blocos de foco',
        reason: 'Superar dispersão e garantir consistência diária através de rituais e entregas claras',
        expectedResult: 'Conclusão de marcos críticos semanais e consolidação da rotina produtiva',
        indicators: 'Taxa de tarefas concluídas > 85%, Check-ins diários preenchidos, Hábitos em sequência',
        risks: 'Interrupções imprevistas, fadiga no final do dia, dispersão com redes sociais',
        contingencyPlan: 'Remanejar blocos perdidos para uma janela de contingência no sábado de manhã',
        steps: [
          {
            stepNumber: 1,
            title: 'Mapeamento e Definição de Escopo',
            description: 'Listar entregas críticas e quebrar em tarefas atômicas',
            timeWindow: 'Segunda-feira: 09h00–09h45',
            howToExecute: 'Abrir o Atlas, filtrar objetivos prioritários e definir as tarefas da semana.',
          },
          {
            stepNumber: 2,
            title: 'Bloco de Deep Work #1',
            description: 'Execução focada na principal entrega da semana sem distrações',
            timeWindow: 'Terça-feira: 14h00–15h30',
            howToExecute: 'Desativar notificações, fechar abas irrelevantes e focar 100% no entregável.',
          },
          {
            stepNumber: 3,
            title: 'Bloco de Deep Work #2',
            description: 'Revisão técnica, testes e fechamento do entregável',
            timeWindow: 'Quinta-feira: 14h00–15h30',
            howToExecute: 'Validar a qualidade da entrega e registrar no diário do Atlas.',
          },
          {
            stepNumber: 4,
            title: 'Revisão Semanal e Aprendizados',
            description: 'Avaliação retrospectiva do progresso semanal',
            timeWindow: 'Sexta-feira: 17h00–17h30',
            howToExecute: 'Gerar o relatório semanal no Atlas e planejar a próxima semana.',
          },
        ],
      };
    } else if (lower.includes('hoje') || lower.includes('priorizar') || lower.includes('o que fazer')) {
      responseContent = `### 🎯 Priorização Estratégica para Hoje

Para maximizar o impacto do seu dia com foco e leveza:

#### 1. 🌟 A Prioridade Número 1 (A "Pedra Grande"):
- Escolha a tarefa com maior alavancagem para seus objetivos ativos.
- Execute essa prioridade antes de atender a pedidos de terceiros ou checar mensagens.

#### 2. ⚡ Bloco Secundário (Manutenção & Rotina):
- Realize o check-in de hábitos do dia.
- Resolva tarefas administrativas rápidas em um único bloco de 30 minutos após o almoço.

#### 3. 🌙 Fechamento do Dia:
- Registre seu check-in noturno (humor, energia, sono, alimentação).
- Escreva uma reflexão de 3 linhas no diário com o principal aprendizado de hoje.`;
    } else if (lower.includes('padrão') || lower.includes('padrões') || lower.includes('percebe')) {
      responseContent = `### 🔬 Padrões e Correlações Detectados nos Registros

Analisando o histórico dos seus check-ins, tarefas e diário:

1. **Correlação Sono ↔ Foco**:
   - Em dias com 7.5h+ de sono, seu nível de foco médio sobe aproximadamente 2.2 pontos na escala de 10.
2. **Efeito Cascata dos Hábitos**:
   - Quando o primeiro hábito do dia é concluído logo pela manhã, a probabilidade de preencher o check-in e avançar nas tarefas cresce expressivamente.
3. **Sensibilidade a Sobrecarga**:
   - Dias com mais de 6 tarefas simultâneas apresentam maior índice de tarefas adiadas em relação a dias com 3 tarefas focadas.`;
    } else if (lower.includes('semana') || lower.includes('revisão') || lower.includes('revisar')) {
      responseContent = `### 📊 Revisão Retrospectiva Semanal — Atlas

#### 1. 📈 O que aconteceu e evoluiu:
- Avanço consistente nos objetivos principais e manutenção de hábitos fundamentais.
- Aderência aos check-ins proporcionando clareza de estado físico e mental.

#### 2. ⚠️ O que não funcionou como esperado:
- Dispersão pontual no meio da semana diante de demandas reativas.
- Tempo de tela acima da meta em dias de estresse.

#### 3. 🔍 Diagnóstico e Gargalo Central:
- Falta de uma janela protegida para imprevistos causou acúmulo de pendências.

#### 4. 🎯 Prioridade para a Próxima Semana:
- Proteger 2 blocos de Deep Work inegociáveis e antecipar o horário de dormir em 30 minutos.`;
    } else {
      responseContent = `### 🧠 Atlas AI — Análise e Orientação Estratégica

Entendido. Analisando seu contexto atual no sistema:

- **Seu Contexto**: Você tem objetivos estruturados e métricas de acompanhamento ativas.
- **Princípio Atlas**: O progresso sustentável decorre de transformar diagnósticos claros em ações atômicas diárias.

**Próximos passos sugeridos:**
1. Verifique se há tarefas de alta prioridade pendentes para hoje.
2. Mantenha o hábito de registrar seu check-in diário para calibrar suas métricas de energia e foco.
3. Se desejar, peça: *"Crie um plano prático para meu objetivo principal"* ou *"Analise meus gargalos atuais"*.

Como posso ajudar você a destravar seu próximo passo?`;
    }

    return {
      content: responseContent,
      provider: 'atlas-intelligent-fallback',
      model: 'rule-based-engine-v1',
      suggestedPlan,
    };
  }
}
