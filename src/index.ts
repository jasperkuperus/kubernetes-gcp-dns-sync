import { getExternalNodeIPs } from './k8s';

(async function() {
  console.log(JSON.stringify(await getExternalNodeIPs(), null, 2));
})();
