import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 5,
    duration: '30s',
};

export default function () {

    // Teste 1: Página inicial
    const home = http.get('https://quickpizza.grafana.com');

    check(home, {
        'Página inicial - Status 200': (r) => r.status === 200,
    });

    // Teste 2: Verificar tempo de resposta
    check(home, {
        'Página inicial - Resposta abaixo de 2 segundos': (r) => r.timings.duration < 2000,
    });

    // Teste 3: Verificar se a resposta possui conteúdo
    check(home, {
        'Página inicial - Retornou conteúdo': (r) => r.body.length > 0,
    });

    sleep(1);
}
