// Jogo "Colheita da Conexão" - Versão com Design de Blocos
let caminhao;
let estrada;
let produtos = [];
let cidade = [];
let fazenda = [];
let pontuacao = 0;
let velocidade = 2;
let tempoRestante = 60;
let ultimoProduto = 0;
let estadoJogo = "jogando";
let imgFundo;

function preload() {
  // Poderia adicionar imagens de bloco aqui se quiser
}

function setup() {
  createCanvas(800, 500);
  noStroke();
  
  // Inicializa elementos com design de blocos
  caminhao = {
    x: 100,
    y: height/2,
    largura: 100,
    altura: 60,
    carregando: null,
    rodas: 20
  };
  
  estrada = {
    x: 0,
    y: height/2 + 30,
    largura: width,
    altura: 80
  };
  
  // Cria prédios da cidade (blocos coloridos)
  for (let i = 0; i < 5; i++) {
    cidade.push({
      x: width - 150 - i * 60,
      y: height/2 - 100 - i * 20,
      largura: 50,
      altura: 100 + i * 40,
      cor: color(100 + i * 30, 120 + i * 20, 150 + i * 10)
    });
  }
  
  // Cria elementos da fazenda (blocos orgânicos)
  fazenda.push({ // Celeiro
    x: 30,
    y: height/2 - 80,
    largura: 120,
    altura: 80,
    cor: color(160, 82, 45)
  });
  
  fazenda.push({ // Campo de plantação
    x: 30,
    y: height/2,
    largura: 180,
    altura: 100,
    cor: color(34, 139, 34)
  });
  
  fazenda.push({ // Silo
    x: 160,
    y: height/2 - 60,
    largura: 40,
    altura: 60,
    cor: color(210, 180, 140)
  });
}

function draw() {
  background(135, 206, 235); // Céu azul
  
  // Desenha sol (bloco circular)
  fill(255, 255, 0);
  ellipse(100, 80, 80, 80);
  
  drawCenario();
  
  if (estadoJogo === "jogando") {
    atualizarJogo();
    verificarCondicoes();
  } else {
    telaFinal();
  }
  
  drawHUD();
}

function drawCenario() {
  // Gramado inferior
  fill(34, 139, 34);
  rect(0, height - 50, width, 50);
  
  // Estrada com design de bloco
  fill(80);
  rect(estrada.x, estrada.y, estrada.largura, estrada.altura);
  
  // Faixas da estrada (blocos amarelos)
  fill(255, 255, 0);
  for (let x = 20; x < width; x += 80) {
    rect(x, estrada.y + estrada.altura/2 - 10, 60, 20);
  }
  
  // Desenha cidade (blocos de prédios)
  for (let predio of cidade) {
    fill(predio.cor);
    rect(predio.x, predio.y, predio.largura, predio.altura);
    
    // Janelas (blocos pequenos)
    fill(255, 255, 150);
    for (let y = predio.y + 15; y < predio.y + predio.altura - 10; y += 25) {
      for (let x = predio.x + 10; x < predio.x + predio.largura - 10; x += 20) {
        rect(x, y, 10, 15);
      }
    }
  }
  
  // Placa "CIDADE"
  fill(255);
  rect(width - 100, height/2 - 120, 80, 20);
  fill(0);
  textSize(16);
  text("CIDADE", width - 90, height/2 - 105);
  
  // Desenha fazenda (blocos rurais)
  for (let elemento of fazenda) {
    fill(elemento.cor);
    rect(elemento.x, elemento.y, elemento.largura, elemento.altura);
  }
  
  // Detalhes do celeiro (design de bloco)
  fill(139, 69, 19);
  triangle(fazenda[0].x, fazenda[0].y, 
           fazenda[0].x + fazenda[0].largura, fazenda[0].y,
           fazenda[0].x + fazenda[0].largura/2, fazenda[0].y - 40);
  
  // Porta do celeiro
  fill(101, 67, 33);
  rect(fazenda[0].x + 40, fazenda[0].y + 20, 40, 60);
  
  // Placa "FAZENDA"
  fill(255);
  rect(50, height/2 - 100, 80, 20);
  fill(0);
  text("FAZENDA", 55, height/2 - 85);
  
  // Desenha caminhão (estilo bloco)
  fill(200, 50, 50); // Cabine
  rect(caminhao.x, caminhao.y, caminhao.largura * 0.4, caminhao.altura);
  
  fill(180, 40, 40); // Carroceria
  rect(caminhao.x + caminhao.largura * 0.4, caminhao.y, caminhao.largura * 0.6, caminhao.altura * 0.8);
  
  // Rodas (blocos circulares)
  fill(0);
  ellipse(caminhao.x + 20, caminhao.y + caminhao.altura, caminhao.rodas, caminhao.rodas);
  ellipse(caminhao.x + caminhao.largura - 20, caminhao.y + caminhao.altura, caminhao.rodas, caminhao.rodas);
  
  // Janela da cabine
  fill(200, 230, 255);
  rect(caminhao.x + 10, caminhao.y + 10, 25, 20);
  
  // Desenha produto carregado (bloco flutuante)
  if (caminhao.carregando) {
    fill(caminhao.carregando.cor);
    rect(caminhao.x + 60, caminhao.y - 25, 30, 30);
    
    // Efeito de flutuação
    let offset = sin(frameCount * 0.1) * 2;
    rect(caminhao.x + 60, caminhao.y - 25 + offset, 30, 30);
  }
  
  // Desenha produtos na fazenda (blocos coloridos)
  for (let produto of produtos) {
    if (!produto.coletado) {
      fill(produto.cor);
      // Efeito de crescimento para chamar atenção
      let tamanho = 20 + (millis() - produto.tempoCriado) % 1000 / 1000 * 10;
      rect(produto.x, produto.y, tamanho, tamanho);
    }
  }
}

function atualizarJogo() {
  // Controles melhorados
  if (keyIsDown(LEFT_ARROW) && caminhao.x > 0) {
    caminhao.x -= velocidade;
  }
  if (keyIsDown(RIGHT_ARROW) && caminhao.x < width - caminhao.largura) {
    caminhao.x += velocidade;
  }
  
  // Gera novos produtos na fazenda
  if (millis() - ultimoProduto > 1500) {
    criarProduto();
    ultimoProduto = millis();
  }
  
  // Atualiza tempo
  if (frameCount % 60 === 0 && tempoRestante > 0) {
    tempoRestante--;
  }
  
  verificarColisaoProdutos();
  verificarEntrega();
}

function criarProduto() {
  let coresProdutos = [
    color(255, 50, 50),    // Vermelho (tomate)
    color(255, 200, 0),    // Amarelo (milho)
    color(50, 200, 50),    // Verde (alface)
    color(160, 80, 40),    // Marrom (batata)
    color(255, 120, 0),    // Laranja (cenoura)
    color(200, 0, 200)     // Roxo (berinjela)
  ];
  
  let novoProduto = {
    x: random(fazenda[1].x + 20, fazenda[1].x + fazenda[1].largura - 20),
    y: random(fazenda[1].y + 20, fazenda[1].y + 40),
    cor: random(coresProdutos),
    coletado: false,
    tempoCriado: millis()
  };
  
  produtos.push(novoProduto);
}

function verificarColisaoProdutos() {
  if (!caminhao.carregando) {
    for (let i = produtos.length - 1; i >= 0; i--) {
      let produto = produtos[i];
      if (!produto.coletado && 
          caminhao.x < produto.x + 30 &&
          caminhao.x + caminhao.largura > produto.x &&
          caminhao.y < produto.y + 30 &&
          caminhao.y + caminhao.altura > produto.y) {
        produto.coletado = true;
        caminhao.carregando = produto;
        break;
      }
    }
  }
}

function verificarEntrega() {
  if (caminhao.carregando && 
      caminhao.x + caminhao.largura > cidade[0].x) {
    pontuacao += 10;
    caminhao.carregando = null;
    
    // Efeito de dificuldade progressiva
    if (pontuacao % 30 === 0) {
      velocidade += 0.3;
    }
    
    // Efeito visual de entrega
    for (let i = 0; i < 10; i++) {
      fill(random(255), random(255), random(255));
      rect(random(cidade[0].x, cidade[0].x + cidade[0].largura),
           random(cidade[0].y, cidade[0].y + cidade[0].altura),
           5, 5);
    }
  }
}

function verificarCondicoes() {
  if (pontuacao >= 100) {
    estadoJogo = "ganhou";
  } else if (tempoRestante <= 0) {
    estadoJogo = "perdeu";
  }
}

function drawHUD() {
  fill(0, 0, 0, 150);
  rect(10, 10, 200, 80, 10);
  fill(255);
  textSize(18);
  text(`Pontuação: ${pontuacao}/100`, 20, 35);
  text(`Tempo: ${tempoRestante}s`, 20, 60);
  
  // Barra de progresso estilo bloco
  fill(100);
  rect(width/2 - 100, 30, 200, 20, 5);
  fill(50, 200, 50);
  rect(width/2 - 100, 30, map(pontuacao, 0, 100, 0, 200), 20, 5);
}

function telaFinal() {
  fill(0, 0, 0, 200);
  rect(width/2 - 180, height/2 - 100, 360, 200, 20);
  fill(255);
  textSize(32);
  textAlign(CENTER);
  
  if (estadoJogo === "ganhou") {
    fill(100, 255, 100);
    text("CONEXÃO COMPLETA!", width/2, height/2 - 50);
    textSize(20);
    text("Campo e cidade unidos!", width/2, height/2 - 10);
  } else {
    fill(255, 100, 100);
    text("TEMPO ESGOTADO!", width/2, height/2 - 50);
    textSize(20);
    text(`Você entregou ${pontuacao} pontos`, width/2, height/2 - 10);
  }
  
  textSize(16);
  text("Pressione F5 para reconectar", width/2, height/2 + 30);
  textAlign(LEFT);
}

function keyPressed() {
  // Tecla espaço para reiniciar
  if (key === ' ' && estadoJogo !== "jogando") {
    resetarJogo();
  }
}

function resetarJogo() {
  pontuacao = 0;
  tempoRestante = 60;
  velocidade = 2;
  produtos = [];
  caminhao.x = 100;
  caminhao.carregando = null;
  estadoJogo = "jogando";
  ultimoProduto = 0;
}