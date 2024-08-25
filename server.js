import net from "net";

let listaUsuariosConectados = [];
let idsUsuarios = 0;

let server = net.createServer((client) => {
  console.log("Cliente conectado:", client.remoteAddress, client.remotePort);

  client.setEncoding("utf-8");

  client.write("Digite seu nickname com o comando !nick SEU_NICKNAME\n");

  let buffer = "";

  client.on("data", (data) => {
    buffer += data.toString();

    if (buffer.includes("\n")) {
      let message = buffer.trim();
      buffer = "";

      tratarComandos(message);

      if (!client.nickname) {
        client.write("Conexão encerrada. Nickname obrigatório!");
        client.end();
      }
    }
  });

  const tratarComandos = (data) => {
    let comando = String(data).split(" ")[0];
    let valor = String(data).split(comando)[1];
    switch (comando) {
      case "!nick":
        client.nickname = valor;
        client.id = idsUsuarios++;
        listaUsuariosConectados.push(client);
        client.write(`Seu nickname foi definido como ${client.nickname}!\n`);
        console.log(
          `Usuário ID ${client.id} - nickname ${client.nickname} logou!\n`
        );
        mensagensGlobais("novo_usuario", client.nickname, client.id);
        mensagensGlobais("lista_usuarios");
        break;
      case "!users":
        mensagensGlobais("lista_usuarios");
        break;
      case "!sendmsg":
        mensagensGlobais("nova_mensagem", client.nickname, client.id, valor);
      case "!poke":
        const nicknameUsuarioCutucado = valor;
        if (isUsuarioNaSala(nicknameUsuarioCutucado)) {
          client.write(`Você cutucou ${nicknameUsuarioCutucado}`);
          mensagensGlobais(
            "cutucada",
            client.nickname,
            client.id,
            nicknameUsuarioCutucado
          );
        } else {
          client.write("O usuário não está na sala!");
        }
        break;
      case "!help":
        client.write(
          `### LISTA DE COMANDOS: ### \n !changenickname NICK_ATUAL NOVO_NICK - altera o seu nickname  \n !poke nickname - Cutuca um usuário logado na sala \n !sendmsg MENSAGEM - envia uma mensagem na sala \n !users - Lista os usuários logados na sala`
        );
        break;
      default:
        if (client.nickname) {
          client.write(
            "Comando inválido. Digite !help para consultar a lista de comandos!"
          );
        }
    }
  };

  const mensagensGlobais = (comando, nickname, idUsuario, mensagem) => {
    let msg = "";
    switch (comando) {
      case "novo_usuario":
        msg = `${nickname} entrou na sala!\n`;
        break;
      case "lista_usuarios":
        msg = `Usuários conectados: ${JSON.stringify(
          listaUsuariosConectados.map((user) => user.nickname)
        )}\n`;
        break;
      case "nova_mensagem":
        msg = `${nickname}: ${mensagem}\n`;
        break;
      case "cutucada":
        msg = `${nickname} cutucou ${mensagem}`;
        break;
    }
    for (const usuario of listaUsuariosConectados) {
      if (usuario.id === idUsuario && comando !== "nova_mensagem") {
        continue;
      } else if (comando == "cutucada" && client.nickname == mensagem) {
        usuario.write(`${nickname} cutucou voce!`);
      }
      usuario.write(msg);
    }
  };

  const handleMudarNickname = (nickAntigo, novoNick, client) => {
    const usuarioComNickNameNovo = listaUsuariosConectados.find(
      (usuario) => usuario.nickname === novoNick
    );
    if(usuarioComNickNameNovo) {
      return "Já tem um usuário utilizando este nickname!";
    }
    const novaListaUsuarios = listaUsuariosConectados.filter((usuario) => usuario.nickname !== nickAntigo);
    novaListaUsuarios = [
      ...novaListaUsuarios,
      {
        ...client,
        id: usuarioComNickNameNovo.id,
        nickname: novoNick
      }
    ] 
  }
  const isUsuarioNaSala = (nickname) => {
    return listaUsuariosConectados.some(
      (usuario) => usuario.nickname === usuario.nickname
    );
  };

  client.on("end", () => {
    console.log(`Um cliente sem nickname foi desconectado!`);
    listaUsuariosConectados = listaUsuariosConectados.filter(
      (c) => c !== client
    );
  });
});

server.listen(8000, () =>
  console.log("O servidor está rodando na porta 8000!")
);
