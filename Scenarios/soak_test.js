import http from 'k6/http';
import { check, sleep } from 'k6';

// Usa o site QuickPizza. BASE_URL pode apontar para outro ambiente autorizado.
const BASE_URL = __ENV.BASE_URL || 'https://quickpizza.grafana.com';

export const options = {
    // Teste de resistencia (soak): mantem uma carga moderada por bastante tempo
    // para detectar degradacao gradual, vazamentos de memoria ou instabilidade.
    vus: 10,
    duration: '30m',
    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<2000'],
    },
};

export default function () {
    const response = http.get(`${BASE_URL}/`, {
        tags: {
            endpoint: 'homepage',
            test_type: 'soak',
            environment: 'test',
        },
    });

    // Registra sucesso e tempo de resposta ao longo de todo o periodo.
    check(response, {
        'Pagina inicial - status 200': (r) => r.status === 200,
        'Pagina inicial - resposta abaixo de 2 segundos': (r) => r.timings.duration < 2000,
    });

    sleep(1);
}