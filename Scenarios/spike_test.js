import http from 'k6/http';
import { check, sleep } from 'k6';

// Usa o site QuickPizza. BASE_URL pode apontar para outro ambiente autorizado.
const BASE_URL = __ENV.BASE_URL || 'https://quickpizza.grafana.com';

export const options = {
    // Teste de pico: simula um aumento muito rapido de usuarios, mantem o pico
    // por um minuto e observa se o servico se recupera quando a carga cai.
    stages: [
        { duration: '30s', target: 5 },
        { duration: '10s', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '10s', target: 5 },
        { duration: '30s', target: 5 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<2000'],
    },
};

export default function () {
    const response = http.get(`${BASE_URL}/`);

    // Mede se a pagina continua disponivel e rapida durante e depois do pico.
    check(response, {
        'Pagina inicial - status 200': (r) => r.status === 200,
        'Pagina inicial - resposta abaixo de 2 segundos': (r) => r.timings.duration < 2000,
    });

    sleep(1);
}