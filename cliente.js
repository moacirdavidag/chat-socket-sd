import net from "net";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = net.connect(
  {
    host: "localhost",
    port: 8000,
  },
  () => {
    console.log("Conectado ao servidor!");
    console.log("Digite !nick SEU_NICK para se conectar ao chat\n");
    rl.on("line", (input) => {
      client.write(input);
    });
  }
);

client.on("data", (data) => {
  const mensagem = String(data).trim();
  const comando = mensagem.split(" ")[0];
  const args = mensagem.slice(comando.length).trim().split(" ");

  switch (comando) {
    case "!users":
      console.log(`Usuarios conectados: ${args.join(" ")}`);
      break;

    case "!msg":
      const remetenteMsg = args.shift();
      const mensagemCompleta = args.join(" ");
      console.log(`${remetenteMsg}: ${mensagemCompleta}`);
      break;

    case "!poke":
      const remetentePoke = args.shift();
      args.shift();
      console.log(`${remetentePoke} cutucou ${args}`);
      break;

    case "!changenickname":
      const antigoNick = args.shift();
      args.shift();
      console.log(`${antigoNick} alterou seu nickname para ${args[args.length - 1]}`);
      break;

    default:
      console.log('Comando inválido!\n');
  }
});


client.on("error", (error) => {
  console.error("Erro de conexão:", error);
});

client.on("end", () => {
  console.log("Conexão encerrada pelo servidor.");
  rl.close();
});
