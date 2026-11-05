# Testes de carga com k6

Projeto com cenarios de teste de carga para a pagina inicial do [QuickPizza](https://quickpizza.grafana.com/), usando [Grafana k6](https://grafana.com/docs/k6/latest/).

## Requisitos

- Grafana k6 instalado e disponivel no terminal pelo comando `k6`.
- Acesso a internet para enviar requisicoes ao QuickPizza.

Os testes sao executados pelo CLI do k6; nao e necessario instalar dependencias Node.js para executa-los.

## Cenarios

Todos os scripts fazem requisicoes `GET` para `https://quickpizza.grafana.com/`, com uma pausa de um segundo entre iteracoes e as tags `endpoint: homepage`, `environment: test` e `test_type` especifica do cenario.

| Cenario | Arquivo | Perfil de carga |
|---|---|---|
| Carga | [`Scenarios/load_test.js`](Scenarios/load_test.js) | 5 usuarios virtuais (VU) por 30 segundos. |
| Estresse | [`Scenarios/stress_test.js`](Scenarios/stress_test.js) | Aumenta ate 50 VUs, mantem esse nivel e depois reduz a carga; duracao total de 6 minutos. |
| Pico (spike) | [`Scenarios/spike_test.js`](Scenarios/spike_test.js) | Sobe rapidamente de 5 para 100 VUs, mantem o pico por 1 minuto e reduz para 5; duracao total de 2 minutos e 20 segundos. |
| Resistencia (soak) | [`Scenarios/soak_test.js`](Scenarios/soak_test.js) | 10 VUs por 30 minutos, para observar degradacao ao longo do tempo. |
| Escalabilidade | [`Scenarios/scalability_test.js`](Scenarios/scalability_test.js) | Aumenta em etapas de 5, 10, 20 e 30 VUs; duracao total de 4 minutos e 30 segundos. |

Cada script verifica o status HTTP e o tempo de resposta. O teste de carga tambem verifica se a resposta contem conteudo e registra cada requisicao em um contador customizado chamado `numero_de_chamadas`.

## Como executar

Abra um terminal na pasta raiz do projeto e execute o cenario desejado:

```powershell
k6 run .\Scenarios\load_test.js
k6 run .\Scenarios\stress_test.js
k6 run .\Scenarios\spike_test.js
k6 run .\Scenarios\soak_test.js
k6 run .\Scenarios\scalability_test.js
```

Os comandos executam um cenario por vez. Os perfis de estresse, pico e resistencia podem gerar carga significativa; acompanhe a execucao e interrompa-a se observar impacto indesejado no servico.

## Criterios de validacao

Os cenarios definem estes thresholds:

- `http_req_failed`: taxa de requisicoes com falha inferior a 1%.
- `http_req_duration`: percentil 95 abaixo de 2000 ms.
- Checks por requisicao: status 200 e resposta abaixo de 2 segundos.

Se um threshold nao for atingido, o k6 indica falha na execucao. O resultado depende das condicoes do teste e nao deve ser interpretado como garantia de desempenho em outros ambientes.

## Tags

As tags nas requisicoes permitem filtrar e agrupar as metricas do k6:

- `endpoint`: pagina testada (`homepage`).
- `test_type`: tipo de cenario (`load`, `stress`, `spike`, `soak` ou `scalability`).
- `environment`: ambiente identificado pelo teste (`test`).

## Relatorios

Para salvar o resumo de uma execucao em JSON, acrescente `--summary-export` ao comando. Por exemplo:

```powershell
k6 run --summary-export .\Scenarios\reports\spike-test-results.json .\Scenarios\spike_test.js
```

O arquivo [`Scenarios/reports/spike-test-report.md`](Scenarios/reports/spike-test-report.md) e reservado ao relatorio do cenario de pico. Atualize-o com metricas de uma execucao real; nao use valores estimados.
