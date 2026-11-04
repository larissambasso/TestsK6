import http from 'k6/http';
import { check, sleep } from 'k6';

// Usa o site QuickPizza. BASE_URL pode apontar para outro ambiente autorizado.
const BASE_URL = __ENV.BASE_URL || 'https://quickpizza.grafana.com';

export const options = {
    // Teste de carga: mantem poucos usuarios constantes por um periodo curto
    // para verificar o comportamento normal da aplicacao.
    vus: 5,
    duration: '30s',
    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<2000'],
    },
};

export default function () {
    const home = http.get(`${BASE_URL}/`, {
        tags: {
            endpoint: 'homepage',
            test_type: 'load',
            environment: 'test',
        },
    });

    // Confere se a pagina inicial respondeu com sucesso.
    check(home, {
        'Pagina inicial - status 200': (r) => r.status === 200,
    });

    // Verifica que a resposta individual nao demorou mais de 2 segundos.
    check(home, {
        'Pagina inicial - resposta abaixo de 2 segundos': (r) => r.timings.duration < 2000,
    });

    // Confirma que o servidor retornou algum conteudo.
    check(home, {
        'Pagina inicial - retornou conteudo': (r) => r.body.length > 0,
    });

    sleep(1);
}
