const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

initializeApp();

/**
 * Função HTTP que define um custom claim 'isAllowed' para um usuário.
 * Ela será criada na região de São Paulo.
 */
exports.setAllowedUserClaim = onRequest(
  { region: 'southamerica-east1' },
  async (req, res) => {
    // Permite chamadas de qualquer origem (CORS)
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.set('Access-Control-Max-Age', '3600');
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const userEmail = req.body.email;
    if (!userEmail) {
      res.status(400).send({ error: "O corpo da requisição deve conter um 'email'." });
      return;
    }

    try {
      const userRecord = await getAuth().getUserByEmail(userEmail);
      await getAuth().setCustomUserClaims(userRecord.uid, { isAllowed: true });

      console.log(`Sucesso! Claim definido para ${userEmail}`);
      res.status(200).send({
        message: `Sucesso! O usuário ${userEmail} agora tem a permissão 'isAllowed'.`,
      });
    } catch (error) {
      console.error("Erro ao definir custom claim:", error);
      res.status(500).send({ error: error.message });
    }
  }
);
