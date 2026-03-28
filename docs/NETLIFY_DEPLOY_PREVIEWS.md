# 🚀 Configuração de Deploy Previews no Netlify

Este documento explica como configurar os Deploy Previews do Netlify para funcionar com Firebase Authentication.

## 📋 Problema

Quando você abre um Pull Request, o Netlify automaticamente cria uma URL de preview (ex: `https://deploy-preview-26--queens-puzzle.netlify.app`). Porém, o Firebase Authentication bloqueia logins de domínios não autorizados.

## ✅ Solução

### Passo 1: Configurar Domínios Autorizados no Firebase

1. **Acesse o Firebase Console:**
   - URL: https://console.firebase.google.com/
   - Projeto: `queens-puzzle-80a1e`

2. **Navegue até Authentication:**
   - Menu lateral → **Authentication**
   - Aba **Settings**
   - Seção **Authorized domains**

3. **Adicione os seguintes domínios:**
   ```
   localhost                     # Desenvolvimento local
   queens-puzzle.netlify.app     # Produção
   *.netlify.app                 # Todos os deploy previews
   ```

   > **💡 Dica:** Usar `*.netlify.app` autoriza automaticamente TODOS os deploy previews, evitando ter que adicionar manualmente cada URL.

### Passo 2: Configurar Variáveis de Ambiente no Netlify

1. **Acesse o Netlify Dashboard:**
   - URL: https://app.netlify.com/
   - Site: `queens-puzzle`

2. **Navegue até Environment Variables:**
   - **Site configuration** → **Environment variables**

3. **Verifique as seguintes variáveis:**
   ```
   VITE_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN
   VITE_FIREBASE_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID
   VITE_FIREBASE_MEASUREMENT_ID
   ```

4. **Configure o Escopo de cada variável:**

   Para cada variável acima, certifique-se que está marcado:
   - ✅ **Production**
   - ✅ **Deploy Previews** ← **IMPORTANTE!**
   - ✅ **Branch deploys**

### Passo 3: Testar Deploy Preview

1. Abra um Pull Request
2. Aguarde o Netlify gerar a URL de preview
3. Acesse a URL e tente fazer login
4. Deve funcionar normalmente! 🎉

## 🔍 Troubleshooting

### Erro: "auth/unauthorized-domain"

**Causa:** O domínio do deploy preview não está autorizado no Firebase.

**Solução:**
- Verifique se `*.netlify.app` está na lista de domínios autorizados
- Aguarde alguns minutos para o Firebase propagar as mudanças
- Limpe o cache do navegador e tente novamente

### Login funciona localmente mas não no preview

**Causa:** As variáveis de ambiente não estão configuradas para Deploy Previews.

**Solução:**
1. Vá para Netlify → Site configuration → Environment variables
2. Para cada variável do Firebase, certifique-se que **Deploy Previews** está marcado
3. Faça um novo commit para triggerar um novo build

### Preview carrega mas fica em tela de login infinita

**Causa:** Pode ser um problema de cache ou configuração de cookies.

**Solução:**
1. Abra o console do navegador (F12)
2. Verifique se há erros relacionados ao Firebase
3. Tente em uma aba anônima/privada
4. Verifique se as variáveis de ambiente estão corretas

## 📚 Referências

- [Netlify Deploy Previews Documentation](https://docs.netlify.com/site-deploys/deploy-previews/)
- [Firebase Authorized Domains](https://firebase.google.com/docs/auth/web/redirect-best-practices#authorize-domains)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

## 🎯 Checklist de Verificação

Use este checklist para garantir que tudo está configurado:

- [ ] `*.netlify.app` está na lista de domínios autorizados do Firebase
- [ ] Todas as 7 variáveis do Firebase estão configuradas no Netlify
- [ ] Cada variável tem o escopo **Deploy Previews** marcado
- [ ] O código tem tratamento de erro melhorado para domínios não autorizados
- [ ] Testei um deploy preview e o login funcionou

---

**Última atualização:** Novembro 2025
**Mantido por:** Equipe Queens Puzzle
