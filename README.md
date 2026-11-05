# Poke Memory

Este documento explica a lógica do jogo na mesma ordem em que ela acontece durante uma partida. O projeto usa HTML para a estrutura, CSS para a aparência e as animações, e JavaScript para controlar as regras.

## 1. A página é preparada

Quando `scripts.js` é carregado, ele encontra no HTML o tabuleiro, as cartas, o cronômetro, o botão Play e a lista do ranking. Também registra um evento de clique em cada carta.

Antes de uma partida começar, `lockBoard` está como `true`. Isso impede que as cartas sejam viradas antes de apertar Play.

As cartas também podem ser acionadas pelo teclado: com uma carta selecionada, Enter ou Espaço executam o mesmo comportamento do clique.

## 2. O jogador aperta Play

O botão chama `restartGame()`. Essa função prepara uma nova rodada:

1. Para qualquer cronômetro anterior e cancela uma verificação de par que ainda esteja aguardando.
2. Zera o tempo e a quantidade de pares encontrados.
3. Limpa as cartas que estavam viradas ou marcadas como combinadas.
4. Embaralha as cartas chamando `shuffleCards()`.
5. Libera o tabuleiro e inicia o cronômetro.

`shuffleCards()` aplica o algoritmo Fisher–Yates: percorre as cartas de trás para frente e troca cada posição com outra posição escolhida aleatoriamente. Depois, recoloca as cartas nessa ordem no tabuleiro.

## 3. O jogador clica na primeira carta

O clique chama `handleCardClick()` para aquela carta. Antes de fazer qualquer coisa, a função verifica se:

- O tabuleiro está bloqueado enquanto outro par está sendo verificado.
- A carta clicada já é a primeira carta do turno.
- A carta já foi combinada anteriormente.

Se alguma condição for verdadeira, o clique é ignorado. Isso impede, por exemplo, que a mesma carta conte duas vezes no mesmo turno.

Caso contrário, `flipCard()` adiciona a classe `is-flipped` e marca a carta como pressionada para leitores de tela. O CSS usa essa classe para executar a rotação e mostrar o Pokémon. Como ainda não existe uma primeira carta no turno, a carta selecionada é guardada em `firstCard` e o jogo espera outro clique.

## 4. O jogador clica na segunda carta

A segunda carta também é virada. Como `firstCard` já contém uma carta, o jogo guarda a nova seleção em `secondCard`, bloqueia temporariamente o tabuleiro com `lockBoard` e chama `checkForMatch()`.

O bloqueio evita que um terceiro clique interfira enquanto o jogo compara as duas cartas.

## 5. O jogo verifica se as cartas combinam

`checkForMatch()` lê o caminho da imagem do Pokémon em cada carta, pelo elemento `.frente`, e compara os dois valores.

### Se forem iguais

- As duas cartas recebem a classe `is-matched`.
- O CSS mantém o Pokémon visível e a carta deixa de responder como carta disponível.
- `matchedPairs` aumenta em um.
- `resetTurn()` limpa `firstCard` e `secondCard` e libera o tabuleiro para o próximo turno.
- Se todos os pares foram encontrados, o jogo chama `finishGame()`.

### Se forem diferentes

O jogo aguarda 850 milissegundos para que o jogador veja os dois Pokémon. Depois, remove `is-flipped` das duas cartas, escondendo-as novamente, e chama `resetTurn()` para permitir uma nova tentativa.

## 6. O cronômetro acompanha a partida

`startTimer()` agenda `updateTimer()` para rodar a cada segundo. A função soma um segundo a `elapsedSeconds`, formata o valor como `MM:SS` com `formatTime()` e atualiza o texto do cronômetro na página.

Quando todos os pares são encontrados, `finishGame()` chama `stopTimer()`, que cancela o intervalo. Assim, o tempo final não continua avançando.

## 7. O resultado entra no ranking

Ao terminar, `finishGame()` envia o tempo para `addBestTime()`. Os tempos ficam no array `bestTimes`, que existe somente na memória da página:

1. O novo tempo é adicionado ao array.
2. Os valores são ordenados do menor para o maior.
3. `splice(3)` remove qualquer posição além das três primeiras.
4. `renderRanking()` atualiza a lista no HTML e esconde a mensagem inicial.

O ranking não usa `localStorage`, cookies ou servidor. Recarregar ou fechar a página apaga os resultados.

## 8. O jogador reinicia

O botão continua disponível durante e depois da partida. Ao ser clicado novamente, chama `restartGame()` e começa uma nova rodada com cartas embaralhadas e cronômetro zerado. Os melhores tempos permanecem no ranking até a página ser recarregada ou fechada.

## Variáveis principais

| Variável | Para que serve |
| --- | --- |
| `firstCard` e `secondCard` | Guardam as cartas escolhidas no turno atual. |
| `lockBoard` | Bloqueia cliques antes do início ou durante a verificação de um par. |
| `matchedPairs` | Conta quantos pares foram encontrados. |
| `elapsedSeconds` | Guarda o tempo da partida em segundos. |
| `timerInterval` | Identifica o intervalo ativo do cronômetro. |
| `mismatchTimeout` | Identifica a espera antes de esconder duas cartas diferentes. |
| `bestTimes` | Mantém os três melhores tempos da sessão atual da página. |

