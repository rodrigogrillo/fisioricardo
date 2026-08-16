// Passo 1 do login: manda o usuário pro GitHub autorizar o acesso.
module.exports = (req, res) => {
  const client_id = process.env.OAUTH_CLIENT_ID;

  if (!client_id) {
    res.status(500).send('OAUTH_CLIENT_ID não configurado nas variáveis de ambiente do Vercel.');
    return;
  }

  const redirect_uri = `https://${req.headers.host}/api/callback`;
  const scope = 'repo,user';
  const authorize_url =
    `https://github.com/login/oauth/authorize?client_id=${client_id}` +
    `&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${scope}`;

  res.writeHead(302, { Location: authorize_url });
  res.end();
};
