import net from "net";

let listaUsuariosConectados = [];
let idsUsuarios = 0;

let server = net.createServer((client) => {
  client.on('connect', (socket) => {
    console.log(socket);
  })

  client.write("Digite seu nickname com o comando !nick SEU_NICKNAME\n");

  let buffer = "";

  client.on("data", (data) => {
    buffer += data.toString();

    if (buffer.includes("\n")) {
      let message = buffer.trim();
      buffer = "";

      if (message.startsWith("!nick ")) {
        let nickname = message.replace("!nick ", "").trim();
        client.nickname = nickname;
        client.write(`Seu nickname foi definido como ${nickname}\n`);
        client.id = idsUsuarios++;
        client.nickname = `Usuário_${client.id}`;
        listaUsuariosConectados.push(client);
        console.log(`Cliente ${client.id} escolheu o nickname: ${nickname}`);

        client.write(`Usuários conectados:`, listaUsuariosConectados);

      } else {
        client.end(() => {
            client.write("Conexão encerrada. Nickname obrigatório!");
        })
      }
    }
  });

  client.on("end", () => {
    console.log(`Cliente ${client.nickname} desconectou`);
    listaUsuariosConectados = listaUsuariosConectados.filter(
      (c) => c !== client
    );
  });
});

server.listen(8000, () =>
  console.log("O servidor está rodando na porta 8000!")
);
