# Guia do Assistente Financeiro (Telegram Bot)

O StarBot e um assistente financeiro inteligente integrado ao Orbit. Voce conversa com ele pelo Telegram em linguagem natural — ele entende o que voce quer e registra/consulta seus dados automaticamente.

---

## Primeiros Passos

### Passo 1: Encontre seu ID do Telegram

O ID do Telegram e um numero unico que identifica sua conta. Para descobri-lo:

1. Abra o Telegram e pesquise por **@userinfobot**
2. Clique em **Iniciar** (Start)
3. O bot vai responder com seu **ID** — um numero como `1029061795`

> Tambem pode usar @RawDataBot ou qualquer bot de "get my ID".

### Passo 2: Cadastre seu ID no Orbit

1. Acesse o Orbit no navegador e faca login
2. Clique no seu nome/avatar no canto superior direito
3. Va em **Configuracoes** (ou **Perfil**)
4. Localize o campo **"ID do Telegram"**
5. Cole o numero que o @userinfobot te enviou
6. Clique em **Salvar**

### Passo 3: Acesse o Bot no Telegram

1. Abra o Telegram e pesquise pelo nome do seu bot (ex: **@tchagoobot**)
2. Clique em **Iniciar** ou envie `/start`
3. Pronto! O bot vai reconhecer voce automaticamente

> Se aparecer uma mensagem de erro dizendo que seu ID nao esta cadastrado, volte ao Passo 2 e verifique se o ID foi salvo corretamente.

---

## O que o Bot Pode Fazer

O assistente tem acesso completo ao seu Orbit. Voce pode usar linguagem natural — nao precisa de comandos especificos.

### Registrar Transacoes

```
"Gastei 45 reais no mercado hoje"
"Recebi 5200 de salario"
"Paguei 89,90 na farmacia"
"Almoco de 32 reais, conta nubank"
```

O bot automaticamente:
- Identifica se e receita ou despesa
- Sugere a conta e categoria mais adequadas
- Pergunta se tiver duvida
- Confirma o que foi registrado

### Consultar Saldo e Transacoes

```
"Qual meu saldo atual?"
"Quais contas eu tenho?"
"Mostra minhas transacoes de fevereiro"
"Quanto gastei esse mes?"
```

### Relatorio Mensal

```
"Resumo do mes"
"Como fechou janeiro?"
"Relatorio de fevereiro de 2026"
```

O bot retorna: total de receitas, total de despesas, saldo do mes e detalhamento por categoria.

### Orcamentos

```
"Quanto ainda tenho de orcamento em alimentacao?"
"Mostra meus orcamentos"
"Ja estourei algum orcamento?"
```

### Assinaturas e Contas Recorrentes

```
"Quais assinaturas eu tenho?"
"Quando vence a Netflix?"
"Lista minhas contas mensais"
```

### Metas de Poupanca

```
"Quais sao minhas metas?"
"Quanto falta para minha meta de viagem?"
"Quero contribuir 200 reais para a meta de emergencia"
"Cria uma meta de 5000 reais para reforma"
```

### Dividas

```
"Tenho alguma divida?"
"Mostra minhas dividas"
"Qual o valor minimo do meu financiamento?"
```

### Tarefas (To-Do)

```
"Anota pra mim: pagar fatura do cartao"
"Quais tarefas estao pendentes?"
"Conclui a tarefa de pagar fatura"
"Cria uma tarefa: renovar seguro do carro com vencimento em 15/03"
```

### Lembretes

```
"Me lembra do aniversario da minha mae no dia 15 de marco"
"Cria um lembrete para renovar CNH em agosto"
"Quero ser avisado 3 dias antes"
```

### Criar Contas/Carteiras

```
"Cria uma carteira chamada Dinheiro Vivo"
"Adiciona uma conta poupanca com saldo inicial de 1000 reais"
"Cria conta corrente no Bradesco"
```

Tipos de conta disponiveis: Corrente, Poupanca, Cartao de Credito, Investimento, Carteira, Negocio.

---

## Comandos do Bot

Alem da conversa natural, voce pode usar estes comandos:

| Comando | Funcao |
|---------|--------|
| `/start` | Mensagem de boas-vindas |
| `/new` ou `/reset` | Inicia uma nova conversa (limpa o historico) |
| `/status` | Mostra informacoes da sessao atual (tokens usados, modelo) |
| `/model <nome>` | Troca o modelo de IA (ex: `/model claude-opus-4-6`) |
| `/compact` | Comprime o historico da conversa para economizar contexto |
| `/help` | Exibe a lista de comandos |

---

## Dicas de Uso

### Seja Natural

Nao precisa usar formatos especificos. O bot entende:

- `"45 reais no mercado"` = despesa de R$45
- `"recebi meu salario de 5200"` = receita de R$5.200
- `"gastei duzentos reais na academia esse mes"` = despesa R$200

### Datas Relativas

O bot entende datas em linguagem natural:

- `"ontem"`, `"hoje"`, `"semana passada"`
- `"no dia 10"`, `"em marco"`, `"no mes passado"`
- `"proxima terca"`, `"fim do mes"`

### Confirmacao

Quando o bot registrar algo importante (transacao, meta, lembrete), ele sempre confirma o que foi feito antes de finalizar.

### Privacidade

Cada usuario ve apenas os dados da **sua propria familia**. Se voce e da familia X e outra pessoa e da familia Y, os dados de cada um sao completamente separados.

---

## Restricoes

O bot foi configurado para responder **apenas perguntas relacionadas a financas**. Se voce perguntar algo fora do escopo financeiro (receitas de culinaria, previsao do tempo, etc.), ele vai recusar com uma mensagem bem-humorada.

Isso e proposital para evitar desperdicio de tokens e manter o foco.

---

## Solucao de Problemas

### "Seu Telegram ID nao esta cadastrado"

Voce precisa cadastrar seu ID do Telegram no Orbit antes de usar o bot.
Siga o **Passo 2** acima.

### Bot nao responde

- Verifique se o bot esta online: tente enviar `/start`
- Se nao responder, o servidor pode estar reiniciando — aguarde 1-2 minutos
- Em caso de problema persistente, avise o administrador

### Resposta errada ou transacao errada

- Use `/new` para limpar o historico e tentar novamente
- Seja mais especifico: mencione a conta, o valor exato e a data

### Como saber meu saldo em tempo real?

Pergunte diretamente: `"Qual meu saldo atual em todas as contas?"` — o bot consulta o Orbit na hora e retorna os valores atualizados.

---

## Exemplos de Conversa Completa

**Registrando um dia de gastos:**
```
Voce: Gastei 12 reais no cafe da manha
Bot: Registrado: -R$12,00 | Alimentacao | Carteira | hoje ✓

Voce: Almoco foi 28,50 no restaurante
Bot: Registrado: -R$28,50 | Alimentacao | Nubank | hoje ✓

Voce: Paguei estacionamento de 8 reais em dinheiro
Bot: Registrado: -R$8,00 | Transporte | Carteira | hoje ✓

Voce: Quanto gastei hoje?
Bot: Hoje voce gastou R$48,50 em 3 transacoes:
     Alimentacao: R$40,50
     Transporte: R$8,00
```

**Planejando uma meta:**
```
Voce: Quero juntar 10 mil reais para uma viagem ate dezembro
Bot: Meta "Viagem" criada: objetivo R$10.000,00 com prazo em dezembro de 2026.
     Voce precisa guardar aproximadamente R$1.000/mes para atingir a meta. ✓

Voce: Coloca 500 reais nessa meta
Bot: Contribuicao de R$500,00 adicionada a meta "Viagem".
     Progresso: R$500 / R$10.000 (5%) — faltam R$9.500 ✓
```

**Verificando orcamento:**
```
Voce: Como ta meu orcamento de alimentacao?
Bot: Orcamento de Alimentacao (Fevereiro):
     Limite: R$800,00
     Gasto: R$620,50 (77%)
     Restante: R$179,50
     ⚠️ Voce esta proximo do limite!
```
