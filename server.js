import net from "net";

let listaUsuariosConectados = [];
let idsUsuarios = 0;

let server = net.createServer((client) => {
  console.log("Cliente conectado:", client.remoteAddress, client.remotePort);

  client.setEncoding("utf-8");


  let buffer = "";

  client.on("data", (data) => {
    buffer += data.toString();
    
      let message = buffer.trim();
      buffer = "";

      tratarComandos(message);

      if (!client.nickname) {
        client.write("Conexão encerrada. Nickname obrigatório!");
        client.end();
      }
  });

  const tratarComandos = (data) => {
    const usuariosConectados = listaUsuariosConectados.map(usuario => usuario.nickname);
    let comando = String(data).split(" ")[0];
    let valor = String(data).split(comando)[1];
    switch (comando) {
      case "!nick":
        client.nickname = valor;
        client.id = idsUsuarios++;
        listaUsuariosConectados.push(client);
        mensagensGlobais(
          "!nick",
          client.nickname,
          client.id,
          usuariosConectados
        );
        console.log(
          `Usuário ID ${client.id} - nickname ${client.nickname} logou!\n`
        );
        break;
      case "!users":
        client.write(`!users ${JSON.stringify(usuariosConectados)}\n`);
        break;
      case "!sendmsg":
        mensagensGlobais(
          "!msg",
          client.nickname,
          client.id,
          valor
        );
        break;
      case "!poke":
        const nicknameUsuarioCutucado = valor;
        if (isUsuarioNaSala(nicknameUsuarioCutucado)) {
          client.write(`!poke ${client.nickname} ${nicknameUsuarioCutucado}`);
          mensagensGlobais(
            "!poke",
            client.nickname,
            client.id,
            nicknameUsuarioCutucado
          );
        } 
        break;
      case "!changenickname":
        const resultado = handleMudarNickname(client.nickname, valor, client);
          mensagensGlobais(
            "!changenickname",
            resultado.nickAntigo,
            client.id,
            resultado.nickNovo
          );
        break;
      case "!help":
        client.write(
          `### LISTA DE COMANDOS: ### \n !changenickname NICK_ATUAL NOVO_NICK - altera o seu nickname  \n !poke nickname - Cutuca um usuário logado na sala \n !sendmsg MENSAGEM - envia uma mensagem na sala \n !users - Lista os usuários logados na sala`
        );
        break;
    }
  };

  const mensagensGlobais = (comando, nickAntigo, idUsuario, mensagem) => {
    const usuariosConectados = listaUsuariosConectados.map(usuario => usuario.nickname);
    let msg = "";
    switch (comando) {
      case "!nick":
      case "!users":
        msg = `!users ${listaUsuariosConectados.length} ${usuariosConectados.join(" ")}\n`;
        break;
      case "!msg":
        msg = `!msg ${nickAntigo} ${mensagem}`;
        break;
      case "!poke":
        msg = `!poke ${nickAntigo} ${mensagem}`;
        break;
      case "!changenickname":
        msg = `!changenickname ${nickAntigo} alterou seu nickname para ${mensagem}`;
        break;
    }
    for (const usuario of listaUsuariosConectados) {
      if (usuario.write) { 
        usuario.write(msg);
      }
    }
  };

  const handleMudarNickname = (nickAntigo, novoNick, client) => {

    client.nickname = novoNick;
    return { nickAntigo, nickNovo: novoNick };
  };
  
  const isUsuarioNaSala = (nickname) => {
    return listaUsuariosConectados.some(
      (usuario) => usuario.nickname === nickname
    );
  };
  

  client.on("end", () => {
    console.log(`Cliente desconectado: ${client.nickname || 'sem nickname'}`);
    listaUsuariosConectados = listaUsuariosConectados.filter(
      (c) => c !== client
    );
  });

  client.on("error", (err) => {
    console.error("Erro no cliente:", err.message);
    listaUsuariosConectados = listaUsuariosConectados.filter(
      (c) => c !== client
    );
  });
});

server.listen(8000, () =>
  console.log("O servidor está rodando na porta 8000!")
);
