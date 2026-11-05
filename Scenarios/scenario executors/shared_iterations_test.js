import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    scenarios: {
        shared_iterations: {
            executor: 'shared-iterations',
            vus: 10,
            iterations: 200,
            maxDuration: '30s',
        },
    },
};

export default function () {
    http.get('https://quickpizza.grafana.com/');
    sleep(0.5);
}
