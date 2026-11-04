import http from 'k6/http';
import { check, sleep } from 'k6';

// Usa o site QuickPizza. BASE_URL pode apontar para outro ambiente autorizado.
const BASE_URL = __ENV.BASE_URL || 'https://quickpizza.grafana.com';

export const options = {
    // Teste de escalabilidade: aumenta os usuarios em etapas para observar
    // como a latencia e a taxa de erros mudam conforme a carga cresce.
    stages: [
        { duration: '1m', target: 5 },
        { duration: '1m', target: 10 },
        { duration: '1m', target: 20 },
        { duration: '1m', target: 30 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<2000'],
    },
};

export default function () {
    const response = http.get(`${BASE_URL}/`);

    // As mesmas verificacoes em cada etapa permitem comparar os resultados.
    check(response, {
        'Pagina inicial - status 200': (r) => r.status === 200,
        'Pagina inicial - resposta abaixo de 2 segundos': (r) => r.timings.duration < 2000,
    });

    sleep(1);
}