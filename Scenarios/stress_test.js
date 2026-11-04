import http from 'k6/http';
import { check, sleep } from 'k6';

// Usa o site QuickPizza. BASE_URL pode apontar para outro ambiente autorizado.
const BASE_URL = __ENV.BASE_URL || 'https://quickpizza.grafana.com';

export const options = {
    // Teste de estresse: aumenta a carga gradualmente ate um nivel alto e
    // depois a reduz, ajudando a revelar o limite e o comportamento sob pressao.
    stages: [
        { duration: '1m', target: 10 },
        { duration: '2m', target: 50 },
        { duration: '2m', target: 50 },
        { duration: '1m', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<2000'],
    },
};

export default function () {
    const response = http.get(`${BASE_URL}/`, {
        tags: {
            endpoint: 'homepage',
            test_type: 'stress',
            environment: 'test',
        },
    });

    // Cada iteracao confere se a aplicacao continua respondendo corretamente.
    check(response, {
        'Pagina inicial - status 200': (r) => r.status === 200,
        'Pagina inicial - resposta abaixo de 2 segundos': (r) => r.timings.duration < 2000,
    });

    sleep(1);
}