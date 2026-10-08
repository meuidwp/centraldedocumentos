# Central de Documentos – CRAS

Os quatro aplicativos em um só PWA, com um menu inicial:

| App | Pasta |
|---|---|
| Pedido de Certidão | `apps/certidao/` |
| Guia de Remessa / Termo de Entrega | `apps/guia-de-remessa/` |
| Justificativa de Ponto | `apps/justificativa-de-ponto/` |
| RMA – Soma Mensal | `apps/rma/` |

## Como publicar no GitHub Pages
1. Crie um repositório novo (ex.: `central`) e envie **todo o conteúdo desta pasta** para a raiz dele (o `index.html` precisa ficar na raiz).
2. Em **Settings → Pages**, escolha *Deploy from a branch*, branch `main`, pasta `/ (root)`.
3. Abra `https://SEU-USUARIO.github.io/central/` e instale pelo navegador ("Instalar aplicativo" / "Adicionar à tela inicial").

## Atualizar depois
Altere o arquivo do app desejado e, em `sw.js`, aumente o número de `VERSION` (`v1` → `v2`) para os aparelhos baixarem a nova versão.

## Observações
- Cada app guarda os dados no próprio navegador (localStorage), com chaves diferentes, então não se misturam.
- A Justificativa de Ponto baixa as bibliotecas de OCR da internet na primeira leitura de PDF digitalizado; depois ficam em cache.
- Os `manifest` e `sw.js` individuais de cada app foram removidos: agora existe um só, na raiz.
- Em cada app há um botão redondo no canto inferior esquerdo para voltar ao menu (não aparece na impressão).
