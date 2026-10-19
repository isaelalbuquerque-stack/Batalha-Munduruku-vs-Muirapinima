export const WEAPONS=[
 {id:'facao',name:'Facão de exploração',type:'Corpo a corpo',power:16,reach:1.8,delay:530,weight:'Médio',rarity:'Comum',desc:'Lâmina curva com guarda discreta, cabo de madeira e bainha de couro. Serve para combate fictício e abrir trilhas.'},
 {id:'lanca',name:'Lança de madeira',type:'Corpo a corpo',power:19,reach:2.8,delay:780,weight:'Leve',rarity:'Comum',desc:'Haste esculpida, ponta polida e amarrações vegetais. Silhueta longa, estreita e orgânica.'},
 {id:'arco',name:'Arco da floresta',type:'Distância',power:14,reach:12,delay:650,weight:'Leve',rarity:'Incomum',desc:'Curvatura natural, corda esticada, flechas com penas e aljava presa ao tronco.'},
 {id:'tacape',name:'Tacape de combate',type:'Corpo a corpo',power:25,reach:1.5,delay:960,weight:'Pesado',rarity:'Incomum',desc:'Madeira maciça com veios, secção larga arredondada e marcas de uso.'},
 {id:'machadinha',name:'Machadinha',type:'Ferramenta',power:12,reach:1.5,delay:750,weight:'Médio',rarity:'Comum',desc:'Cabeça de aço envelhecido e cabo de madeira escura, usada para coletar madeira.'},
 {id:'amuleto',name:'Amuleto do Trovão',type:'Místico fictício',power:30,reach:6,delay:2300,weight:'Leve',rarity:'Raro',desc:'Pedra entalhada que projeta uma descarga fantástica em guardiões do jogo.'}
];
export const CREATURES=[
 {id:'capivara',name:'Capivara',group:'Fauna',zone:'Margens de rio',threat:0,behavior:'Sociável e cautelosa; foge da aproximação.'},
 {id:'anta',name:'Anta',group:'Fauna',zone:'Mata úmida',threat:0,behavior:'Percorre trilhas e evita contato.'},
 {id:'cutia',name:'Cutia',group:'Fauna',zone:'Sub-bosque',threat:0,behavior:'Corre entre folhagens e dispersa sementes.'},
 {id:'macaco',name:'Macaco-prego',group:'Fauna',zone:'Copa das árvores',threat:0,behavior:'Movimenta-se em grupos e vocaliza.'},
 {id:'arara',name:'Arara',group:'Fauna',zone:'Dossel florestal',threat:0,behavior:'Voa entre árvores; espécie de observação.'},
 {id:'tucano',name:'Tucano',group:'Fauna',zone:'Copa das árvores',threat:0,behavior:'Aparece ao amanhecer em árvores frutíferas.'},
 {id:'boto',name:'Boto-cor-de-rosa',group:'Fauna',zone:'Rio profundo',threat:0,behavior:'Surge na superfície da água.'},
 {id:'tracaja',name:'Tracajá',group:'Fauna',zone:'Praias e rios',threat:0,behavior:'Fica ao sol nas margens e mergulha quando assustado.'},
 {id:'preguica',name:'Bicho-preguiça',group:'Fauna',zone:'Árvores',threat:0,behavior:'Movimento lento em galhos altos.'},
 {id:'veado',name:'Veado-mateiro',group:'Fauna',zone:'Clareiras',threat:0,behavior:'Foge rapidamente de ruídos.'},
 {id:'jacare',name:'Jacaré',group:'Risco ambiental',zone:'Rio e igarapé',threat:2,behavior:'Defende território; pode reagir se for perturbado.'},
 {id:'sucuri',name:'Sucuri',group:'Risco ambiental',zone:'Água rasa',threat:2,behavior:'Fica camuflada e evita exposição.'},
 {id:'piranha',name:'Piranha',group:'Risco ambiental',zone:'Remansos',threat:1,behavior:'Peixe em cardume; perigos fictícios em missões.'},
 {id:'puraque',name:'Puraquê',group:'Risco ambiental',zone:'Água turva',threat:2,behavior:'Descargas elétricas representadas como efeito de jogo.'},
 {id:'onca',name:'Onça-pintada',group:'Risco ambiental',zone:'Mata fechada',threat:3,behavior:'Predador discreto, territorial; pode ser fotografado.'},
 {id:'queixada',name:'Queixada',group:'Risco ambiental',zone:'Trilhas na mata',threat:2,behavior:'Move-se em bandos e se defende.'},
 {id:'jararaca',name:'Jararaca',group:'Risco ambiental',zone:'Folhiço e raízes',threat:2,behavior:'Camuflagem; desviar é melhor que atacar.'},
 {id:'surucucu',name:'Surucucu',group:'Risco ambiental',zone:'Mata úmida',threat:3,behavior:'Encontro raro; manter distância.'},
 {id:'aranha',name:'Aranha-caranguejeira',group:'Risco ambiental',zone:'Solo da floresta',threat:1,behavior:'Esconde-se sob troncos e folhas.'},
 {id:'escorpiao',name:'Escorpião',group:'Risco ambiental',zone:'Sob pedras',threat:1,behavior:'Encontro ao coletar recursos sem proteção.'},
 {id:'maruim',name:'Maruim',group:'Insetos',zone:'Brejos',threat:1,behavior:'Enxames geram incômodo na sobrevivência.'},
 {id:'carapana',name:'Carapanã',group:'Insetos',zone:'Áreas úmidas',threat:1,behavior:'Maior presença ao entardecer.'},
 {id:'caba',name:'Caba / vespa',group:'Insetos',zone:'Troncos e galhos',threat:2,behavior:'Defesa de ninho quando incomodada.'},
 {id:'carrapato',name:'Carrapato',group:'Insetos',zone:'Capim alto',threat:1,behavior:'Risco ambiental em trilhas densas.'},
 {id:'mapinguari',name:'Mapinguari',group:'Guardiões',zone:'Floresta proibida',threat:5,behavior:'Guardião enorme; deslocamento pesado, rugido e golpes ficcionais.'},
 {id:'curupira',name:'Curupira',group:'Guardiões',zone:'Trilhas antigas',threat:4,behavior:'Pés invertidos, rastros falsos, movimentos rápidos.'},
 {id:'jurupari',name:'Jurupari',group:'Guardiões',zone:'Santuário fantástico',threat:5,behavior:'Confronto ritual fantástico envolvendo ilusões.'},
 {id:'matinta',name:'Matinta Perera',group:'Guardiões',zone:'Mata noturna',threat:4,behavior:'Assobios distantes e aparições durante a noite.'},
 {id:'saci',name:'Saci',group:'Guardiões',zone:'Clareiras e redemoinhos',threat:3,behavior:'Movimentos imprevisíveis e armadilhas de vento.'},
 {id:'gaviaoreal',name:'Gavião-real',group:'Fauna',zone:'Árvores altas',threat:0,behavior:'Observação a longa distância no dossel.'}
];
export const RESOURCES=[
 {id:'erva',name:'Ervas da mata',icon:'☘',color:'#8fbb7e'},
 {id:'fruta',name:'Frutas',icon:'◉',color:'#deb86b'},
 {id:'madeira',name:'Madeira',icon:'❙',color:'#b89b75'},
 {id:'agua',name:'Água filtrada',icon:'◈',color:'#76c2da'},
 {id:'fibra',name:'Fibra vegetal',icon:'∿',color:'#b3bc78'},
 {id:'pedra',name:'Pedra',icon:'⬟',color:'#a9a9a1'},
 {id:'resina',name:'Resina',icon:'✦',color:'#d6a96d'},
 {id:'raiz',name:'Raízes',icon:'〽',color:'#b9885a'},
 {id:'flor',name:'Flores',icon:'✽',color:'#d7a2aa'},
 {id:'semente',name:'Sementes',icon:'◌',color:'#ccaf77'},
 {id:'cipo',name:'Cipó',icon:'➰',color:'#779b67'},
 {id:'folha',name:'Folhas',icon:'❧',color:'#88b56b'},
 {id:'barro',name:'Barro',icon:'●',color:'#b4774d'},
 {id:'concha',name:'Conchas',icon:'◓',color:'#ddd1b7'},
 {id:'pena',name:'Penas',icon:'⌁',color:'#cacada'},
 {id:'pedrarara',name:'Cristal fictício',icon:'◆',color:'#83dfda'}
];
export const HEALS=[
 {name:'Curativo limpo',effect:'+18 vida',rule:'Item fictício de jogo; não substitui primeiros socorros.'},
 {name:'Água filtrada',effect:'+22 sede',rule:'Para sobrevivência simulada.'},
 {name:'Ração de trilha',effect:'+22 fome',rule:'Alimento do inventário.'},
 {name:'Repelente',effect:'proteção 60 s',rule:'Somente efeito do jogo.'},
 {name:'Kit de imobilização',effect:'resistência +',rule:'Não representa tratamento real.'},
 {name:'Soro de missão',effect:'restaura status',rule:'Item fantástico, não instrução médica.'},
 {name:'Antídoto mítico',effect:'remove veneno fictício',rule:'Para combate contra criaturas místicas apenas.'}
];
export const GEAR_CLASSES=[
 {id:'explorador',name:'Explorador(a)',desc:'Navegação, coletas e registro da fauna. Afiliação opcional.'},
 {id:'guerreiro',name:'Guerreiro(a)',desc:'Resistência e combate. Escolha Munduruku ou Muirapinima.'},
 {id:'cacador',name:'Rastreador(a)',desc:'Observação e leitura de trilhas.'},
 {id:'guardiao',name:'Protetor(a)',desc:'Apoio ao grupo e uso de amuletos fantásticos.'}
];
