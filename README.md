# Igreja do Nazareno — A Casa

## Rodar localmente
npm install
npm run dev

## Estrutura
- src/App.jsx — componente raiz, roteamento entre telas
- src/screens/ — cada tela do app (Feed, Bíblia, Discipulado, etc.)
- src/components/ — componentes pequenos reutilizáveis
- src/context/ — UserContext e FeedContext
- src/data/ — constantes e dados iniciais (mock data)
- src/utils/ — funções auxiliares
- src/assets/ — logo em base64

## Pendências
- Trocar STORE_WHATSAPP/CANTINA_WHATSAPP pelo número real
- Backend: auth persistente, banco de dados
- Publicação nas lojas (Apple Developer / Google Play)
