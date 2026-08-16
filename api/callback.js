// Passo 2 do login: troca o "code" do GitHub por um token de acesso
// e devolve pro painel de admin (Decap CMS) via postMessage.
module.exports = async (req, res) => {
  const { code } = req.query;
  const client_id = process.env.OAUTH_CLIENT_ID;
  const client_secret = process.env.OAUTH_CLIENT_SECRET;

  if (!code) {
    res.status(400).send('Código de autorização ausente.');
    return;
  }
  if (!client_id || !client_secret) {
    res.status(500).send('OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET não configurados nas variáveis de ambiente do Vercel.');
    return;
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id, client_secret, code }),
    });
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      res.status(400).send(`Erro na autenticação: ${tokenData.error_description || tokenData.error}`);
      return;
    }

    const payload = JSON.stringify({ token: tokenData.access_token, provider: 'github' });

    const html = `<!doctype html><html><body>
<script>
  (function() {
    function receiveMessage(e) {
      window.opener.postMessage(
        'authorization:github:success:${payload.replace(/'/g, "\\'")}',
        e.origin
      );
      window.removeEventListener('message', receiveMessage, false);
    }
    window.addEventListener('message', receiveMessage, false);
    window.opener.postMessage('authorizing:github', '*');
  })();
</script>
</body></html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (err) {
    res.status(500).send('Erro no servidor de autenticação: ' + err.message);
  }
};
