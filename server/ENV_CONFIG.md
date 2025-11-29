# Configuration .env requise

Créer un fichier `.env` à la racine du dossier `server/` avec:

```env
# Database
MONGO_URI=mongodb://127.0.0.1:27017/nxt_helder

# JWT
JWT_SECRET=nxt_helder_secret_key_super_secure_2024
JWT_REFRESH_SECRET=nxt_helder_refresh_secret_key_2024
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Email (optionnel pour tests)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=yourpassword

# OpenAI (optionnel pour IA)
OPENAI_API_KEY=your_openai_key

# Metabase (optionnel)
METABASE_URL=http://localhost:3000
METABASE_SECRET_KEY=your_metabase_key
```
