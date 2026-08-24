// Conteúdo da Área Infantil: histórias bíblicas elaboradas, separadas por turma
// (groupId bate com o id de AGE_GROUPS em constants.js: "p", "m", "g"). A
// história do dia troca sozinha (calculado pela data, sem precisar de backend),
// mas todas ficam navegáveis na aba Histórias, filtradas por faixa etária.
export const BIBLE_STORIES = [
  // 3–5 anos
  {
    id: "criacao", groupId: "p", emoji: "🌎", title: "Deus criou tudo",
    text: "No começo do começo não tinha nada — nem terra, nem céu, nem luz. Só tinha Deus! Aí Deus falou bem forte: \"Que haja luz!\" E a luz apareceu na hora. Depois Deus fez o céu azul, o mar enorme, as montanhas altas, as florzinhas coloridas e todos os bichinhos: os passarinhos que voam, os peixinhos que nadam e os leõezinhos que rugem. No sexto dia, Deus fez a coisa mais especial de todas: as pessoas! E Deus olhou pra tudo que tinha feito e viu que estava tudo muito bom. No sétimo dia, Deus descansou.",
    moral: "Tudo que existe, Deus fez com muito amor — e você é a parte mais especial da criação Dele.",
    verse: "Gênesis 1",
  },
  {
    id: "arca", groupId: "p", emoji: "🌈", title: "A arca de Noé",
    text: "Deus viu que as pessoas estavam se esquecendo Dele, mas Noé amava a Deus de coração. Deus pediu pro Noé construir um barco enorme, bem grandão, porque ia chover por muitos e muitos dias. Noé obedeceu, mesmo sem entender tudo, e construiu a arca do jeitinho que Deus mandou. Depois, colocou dois de cada bichinho lá dentro: elefantes, girafas, coelhinhos, passarinhos, todo mundo! Choveu, choveu, choveu... mas dentro da arca, Noé, sua família e todos os animais ficaram bem seguros e protegidos. Quando a chuva parou, Deus pintou um arco-íris lindo no céu, prometendo que cuidaria sempre do seu povo.",
    moral: "Quando a gente confia e obedece Deus, Ele cuida da gente com muito carinho.",
    verse: "Gênesis 6–9",
  },
  {
    id: "natal", groupId: "p", emoji: "⭐", title: "Jesus nasceu",
    text: "Há muito tempo, um anjo apareceu pra Maria e contou uma notícia maravilhosa: ela ia ter um bebê muito especial, o Filho de Deus. Maria e José viajaram até a cidade de Belém, mas quando chegaram, não tinha nenhum quartinho pra eles dormirem. Então eles ficaram num estábulo, onde ficam os animaizinhos, e foi ali que o Menino Jesus nasceu, numa cama feita de palhinha chamada manjedoura. No céu, uma estrela brilhou bem mais forte que as outras, mostrando o caminho. Uns pastorzinhos que cuidavam de ovelhas correram pra ver o bebê, e uns homens muito sábios vieram de longe trazendo presentes especiais pra Ele.",
    moral: "Jesus veio ao mundo bem pertinho da gente, com muito amor pra cada família.",
    verse: "Lucas 2",
  },
  {
    id: "moises-cesta", groupId: "p", emoji: "🧺", title: "Moisés na cestinha",
    text: "Fazia muito tempo, um bebê chamado Moisés nasceu numa família que amava muito a Deus. Só que naquela época, um rei malvado não queria que os bebês do povo de Deus crescessem. Pra proteger seu filhinho, a mamãe de Moisés fez uma cestinha bem forte, colocou o bebê dentro, bem quietinho, e deixou a cestinha boiando devagarinho no rio. A irmã de Moisés ficou de olho, escondidinha, cuidando de tudo de longe. Uma princesa foi tomar banho no rio, encontrou a cestinha e ficou encantada com o bebê — decidiu cuidar dele como se fosse seu próprio filho! Deus tinha um plano enorme pra Moisés desde bebezinho.",
    moral: "Deus cuida da gente mesmo antes da gente entender, e Ele tem planos lindos pra cada criança.",
    verse: "Êxodo 2",
  },
  {
    id: "jose-tunica", groupId: "p", emoji: "👕", title: "José e a túnica colorida",
    text: "José era um menino muito amado pelo seu papai, que até deu de presente pra ele uma túnica linda, cheia de cores! Os irmãos mais velhos de José ficaram com um pouquinho de inveja, porque também queriam ser tão amados assim. Mesmo passando por dias difíceis longe da sua família, José continuou confiando em Deus com todo o coração, sem nunca desistir. Deus estava com José em cada passo do caminho, cuidando dele com muito carinho. Depois de um tempo, José virou uma pessoa muito importante, que ajudou muita, muita gente a não passar fome. E ele conseguiu reencontrar sua família de novo, com um abraço cheio de perdão e alegria.",
    moral: "Mesmo nos dias difíceis, Deus está cuidando da gente e preparando coisas boas.",
    verse: "Gênesis 37–45",
  },
  {
    id: "davi-pastor", groupId: "p", emoji: "🐑", title: "Davi, o pastorzinho",
    text: "Davi era o caçula de muitos irmãos, e o trabalho dele era cuidar das ovelhinhas do seu papai no campo. Todo dia, Davi levava as ovelhas pra comer graminha fresquinha e beber água limpinha, sempre de olho pra nenhuma se perder. Às vezes vinha um leão ou um urso querendo pegar uma ovelhinha, mas Davi, com coragem e confiando em Deus, protegia o rebanho inteirinho. Enquanto cuidava das ovelhas, Davi cantava lindas canções de louvor pra Deus e tocava harpa. Mesmo sendo só um menino pastor, Deus via o coração bondoso de Davi e tinha planos incríveis pra ele — um dia, Davi se tornaria um grande rei!",
    moral: "Deus não olha só pro tamanho da gente, Ele olha pro nosso coração.",
    verse: "1 Samuel 16–17",
  },
  {
    id: "jesus-criancas", groupId: "p", emoji: "🤗", title: "Jesus abençoa as criancinhas",
    text: "Um dia, muitas mamães e papais levaram seus filhinhos pra perto de Jesus, porque queriam que Ele abençoasse cada criança com as mãozinhas Dele. Os amigos de Jesus acharam que Ele estava muito ocupado e tentaram mandar as crianças embora. Mas Jesus disse bem carinhoso: \"Deixem as criancinhas virem até mim, não as impeçam!\" Jesus pegou cada criança no colo, com muito carinho, colocou as mãos sobre elas e abençoou uma por uma. Ele disse que o Reino de Deus é feito pra quem tem um coração puro e confiante, igualzinho ao de uma criança.",
    moral: "Jesus ama muito as crianças e adora ter cada uma delas pertinho Dele.",
    verse: "Marcos 10:13-16",
  },
  {
    id: "jonas-peixe", groupId: "p", emoji: "🐳", title: "Jonas e o peixe grande",
    text: "Deus pediu pro Jonas ir contar pra uma cidade bem grande que precisava mudar de vida. Só que Jonas ficou com medo e fugiu pro lado contrário, entrando num barco bem longe dali. No meio do mar veio uma tempestade forte, forte, e Jonas caiu na água! Mas Deus, com muito cuidado, mandou um peixe gigante engolir o Jonas inteirinho, e ele ficou bem protegido na barriga do peixe por três dias. Jonas orou pra Deus, pedindo desculpas, e o peixão o cuspiu bem pertinho da praia, são e salvo! Depois disso, Jonas foi corajoso e fez o que Deus tinha pedido desde o começo.",
    moral: "Quando a gente foge de Deus, Ele ainda assim cuida da gente e nos dá outra chance.",
    verse: "Jonas 1–2",
  },
  {
    id: "adao-eva", groupId: "p", emoji: "🌳", title: "Adão, Eva e o jardim lindo",
    text: "Deus fez um jardim lindo, cheio de árvores frutíferas, flores coloridas e bichinhos de todo tipo, chamado Éden. Ali, Deus criou o primeiro homem, Adão, e disse que ele cuidaria daquele jardim maravilhoso. Deus viu que Adão precisava de uma companheira, então criou Eva, e os dois viviam felizes, conversando com Deus todos os dias, sem nenhum medo ou vergonha. Deus só pediu uma coisinha: que eles não comessem o fruto de uma árvore especial no meio do jardim. Só que um dia, Eva e depois Adão desobedeceram e comeram o fruto proibido, e ficaram tristes e envergonhados. Mesmo assim, Deus, com muito amor, não abandonou Adão e Eva — Ele já tinha um plano pra cuidar deles e de toda a sua família pra sempre.",
    moral: "Mesmo quando a gente erra, o amor de Deus por nós nunca acaba.",
    verse: "Gênesis 2–3",
  },
  {
    id: "abraao-estrelas", groupId: "p", emoji: "✨", title: "Abraão e as estrelinhas do céu",
    text: "Deus chamou um homem chamado Abraão e pediu pra ele deixar sua terra e sua família, e ir morar num lugar novo que Deus ia mostrar pra ele. Abraão confiou em Deus e obedeceu, mesmo sem saber exatamente pra onde estava indo. Deus prometeu que Abraão teria muitos, muitos filhos e netos — uma família enorme! Só que Abraão e sua esposa Sara já eram bem velhinhos e não tinham nenhum filho ainda. Uma noite, Deus levou Abraão pra fora da tenda e disse: \"Olhe para o céu e conte as estrelas, se você conseguir — assim será a sua descendência!\" Abraão acreditou na promessa de Deus, e com o tempo, Deus cumpriu tudo direitinho, dando a Abraão e Sara um filho muito especial.",
    moral: "Deus sempre cumpre o que promete, mesmo quando parece impossível pra gente.",
    verse: "Gênesis 12, 15, 21",
  },
  {
    id: "rute-noemi", groupId: "p", emoji: "🌾", title: "Rute e sua amiga Noemi",
    text: "Rute era uma moça que amava muito sua sogra, Noemi, e as duas passaram por um tempo bem triste, perdendo pessoas queridas da família. Noemi decidiu voltar pra sua terra natal, e disse pra Rute que ela era livre pra voltar pra família dela também. Mas Rute, com um coração cheio de amor e lealdade, disse: \"Não me peça para deixar você, porque aonde você for, eu irei; o seu povo será o meu povo, e o seu Deus será o meu Deus.\" As duas viajaram juntas, e Rute trabalhava recolhendo espigas de trigo nos campos pra elas terem o que comer. Deus cuidou de Rute e Noemi, e Rute encontrou um homem bondoso chamado Boaz, que se casou com ela e cuidou das duas com muito carinho.",
    moral: "A amizade de verdade fica pertinho da gente até nos momentos mais difíceis.",
    verse: "Rute 1–4",
  },
  {
    id: "samuel-ouve", groupId: "p", emoji: "👂", title: "Samuel ouve a voz de Deus",
    text: "Samuel era um menino que morava no templo, ajudando um sacerdote idoso chamado Eli a cuidar das coisas de Deus. Numa noite, enquanto Samuel dormia, ele ouviu uma voz chamando seu nome: \"Samuel, Samuel!\" Ele correu até Eli, pensando que era ele quem tinha chamado, mas Eli disse que não tinha sido ele. Isso aconteceu mais duas vezes, até que Eli entendeu que era o próprio Deus chamando o menino, e ensinou Samuel a responder: \"Fala, Senhor, que o teu servo está ouvindo.\" Da próxima vez que a voz chamou, Samuel respondeu do jeitinho que Eli tinha ensinado, e Deus começou a falar com ele. Samuel cresceu e se tornou um grande profeta, que sempre ouvia e obedecia a voz de Deus.",
    moral: "Deus gosta de falar com a gente, e é importante aprender a escutar com o coração.",
    verse: "1 Samuel 3",
  },
  {
    id: "pedro-anda-agua", groupId: "p", emoji: "🌊", title: "Pedro anda sobre a água",
    text: "Uma noite, os discípulos estavam no barco no meio do lago, enquanto Jesus tinha ficado na montanha orando sozinho. Bem tarde da noite, os discípulos viram alguém andando por cima da água, vindo na direção deles, e ficaram morrendo de medo, achando que era um fantasma! Mas era Jesus, que disse: \"Tenham coragem, sou eu, não tenham medo.\" Pedro, cheio de empolgação, gritou: \"Senhor, se é o senhor mesmo, mande que eu vá até aí andando sobre a água!\" Jesus disse \"venha\", e Pedro, incrivelmente, desceu do barco e começou a andar sobre a água também! Mas quando Pedro olhou pro vento forte, ficou com medo e começou a afundar — Jesus, na mesma hora, esticou a mão e o segurou, dizendo: \"Por que você duvidou?\"",
    moral: "Quando a gente olha pra Jesus e confia Nele, Ele nos ajuda mesmo nas horas de medo.",
    verse: "Mateus 14:22-33",
  },
  {
    id: "cego-bartimeu", groupId: "p", emoji: "👀", title: "Jesus cura o cego Bartimeu",
    text: "Bartimeu era um homem cego que ficava sentado à beira do caminho, perto da cidade de Jericó, pedindo esmolas pra sobreviver. Quando ele ouviu que Jesus estava passando por ali com uma multidão enorme, começou a gritar bem alto: \"Jesus, filho de Davi, tenha piedade de mim!\" Muitas pessoas mandaram ele ficar quieto, mas Bartimeu gritou ainda mais forte, sem desistir. Jesus parou tudo e disse: \"Chamem ele aqui.\" Bartimeu, cheio de alegria, jogou fora sua capa e correu até Jesus. Jesus perguntou: \"O que você quer que eu faça por você?\" E Bartimeu respondeu: \"Mestre, que eu possa ver!\" Na mesma hora, Jesus curou seus olhos, e Bartimeu, cheio de gratidão, passou a seguir Jesus pelo caminho, enxergando tudo pela primeira vez.",
    moral: "Jesus escuta quem clama por Ele com fé, mesmo quando todo mundo manda a pessoa ficar quieta.",
    verse: "Marcos 10:46-52",
  },

  // 6–8 anos
  {
    id: "davi-golias", groupId: "m", emoji: "🪨", title: "Davi e Golias",
    text: "Golias era um gigante enorme e assustador, do exército inimigo, e ele desafiava o exército inteiro de Israel todos os dias, achando que ninguém teria coragem de enfrentá-lo. Davi, que era só um menino pastor que tinha ido levar comida pros irmãos no acampamento, ouviu aquele desafio e ficou indignado, porque Golias estava desonrando o nome de Deus. Mesmo o rei Saul achando que Davi era muito novo e fraco pra lutar, Davi confiava que Deus estava com ele, do jeito que já tinha ajudado antes contra o leão e o urso. Davi pegou só uma estilingue e cinco pedrinhas lisas do riacho, sem nenhuma armadura pesada. Com fé e pontaria certeira, Davi lançou a pedra bem no meio da testa do gigante, e Golias caiu no chão na hora! O exército inimigo, assustado, saiu correndo, e todo o povo de Israel comemorou a grande vitória que Deus tinha dado.",
    moral: "Com Deus do nosso lado, a gente pode enfrentar até os gigantes mais assustadores da vida.",
    verse: "1 Samuel 17",
  },
  {
    id: "daniel-leoes", groupId: "m", emoji: "🦁", title: "Daniel na cova dos leões",
    text: "Daniel era um homem que amava muito a Deus e orava pra Ele três vezes todo santo dia, sem falhar nenhuma vez. Uns homens que tinham inveja de Daniel convenceram o rei a fazer uma lei maluca: por trinta dias, ninguém podia orar pra ninguém a não ser pro próprio rei. Mesmo sabendo do perigo, Daniel continuou orando a Deus normalmente, com a janela aberta, sem se esconder. Por causa disso, o rei, mesmo sem querer, teve que jogar Daniel numa cova cheia de leões famintos. Só que Deus mandou um anjo fechar bem fechadinho a boca de cada leão, e Daniel passou a noite inteira lá dentro sem nenhum arranhãozinho! No dia seguinte, o rei correu até a cova e ficou maravilhado ao ver Daniel vivo e são, e desde aquele dia, mandou que todo mundo respeitasse o Deus de Daniel.",
    moral: "Deus cuida e protege quem é fiel a Ele, mesmo nos momentos mais difíceis e assustadores.",
    verse: "Daniel 6",
  },
  {
    id: "tempestade", groupId: "m", emoji: "⛵", title: "Jesus acalma a tempestade",
    text: "Depois de um dia inteiro ensinando muitas pessoas, Jesus disse pros discípulos: \"vamos atravessar pro outro lado do lago.\" Eles entraram no barco, e Jesus, bem cansado, foi lá pro fundo do barco e dormiu tranquilamente numa almofada. De repente, veio uma tempestade forte, com ventos fortíssimos e ondas enormes que começaram a encher o barco de água. Os discípulos, muitos deles pescadores experientes, ficaram apavorados, achando que iam todos se afogar. Correndo, eles acordaram Jesus gritando: \"Mestre, não se importa que estamos morrendo?\" Jesus se levantou, olhou pro vento e pro mar, e disse com autoridade: \"Acalme-se, aquiete-se!\" Na mesma hora, tudo ficou completamente calmo. Os discípulos, abismados, se perguntaram: \"Quem é esse, que até o vento e o mar Lhe obedecem?\"",
    moral: "Jesus tem poder sobre tudo, e está sempre com a gente nas tempestades da vida.",
    verse: "Marcos 4:35-41",
  },
  {
    id: "jose-egito", groupId: "m", emoji: "🌾", title: "José perdoa os irmãos",
    text: "José, quando era mais novo, foi tratado muito mal pelos próprios irmãos, que ficaram com inveja dele e acabaram vendendo José como escravo pro Egito. Mesmo passando por injustiças, sendo preso sem culpa nenhuma, José nunca deixou de confiar em Deus. Com o tempo, Deus deu a José a sabedoria de interpretar um sonho do rei do Egito, avisando que viriam sete anos de fartura seguidos de sete anos de fome muito grande. O rei ficou tão impressionado que colocou José como governador de todo o Egito, só atrás dele em poder! Quando a fome chegou, os irmãos de José, sem saber quem ele era, vieram do Egito pedir comida. José os reconheceu na hora, chorou de emoção, e em vez de se vingar, abraçou cada um deles e disse: \"Vocês pensaram em me fazer mal, mas Deus transformou tudo em bem, para salvar muita gente.\"",
    moral: "Deus pode transformar as coisas mais difíceis da nossa vida em algo bom, e o perdão é sempre o melhor caminho.",
    verse: "Gênesis 37–45",
  },
  {
    id: "moises-mar", groupId: "m", emoji: "🌊", title: "Moisés e o Mar Vermelho",
    text: "Depois de anos sendo escravos no Egito, o povo de Deus finalmente estava livre, seguindo Moisés rumo a uma terra nova. Só que o rei do Egito mudou de ideia e mandou todo o seu exército, com carros de guerra, perseguir o povo de Deus. Quando o povo chegou na beira do Mar Vermelho, ficou desesperado: na frente, um mar enorme; atrás, o exército chegando. Moisés disse pro povo não ter medo, e esticou seu cajado sobre o mar, confiando em Deus. Na mesma hora, Deus abriu um caminho seco bem no meio do mar, com paredes de água dos dois lados! Todo o povo atravessou em segurança, e quando o exército tentou seguir, as águas voltaram ao normal, e o povo de Deus ficou livre de verdade, cantando de alegria na outra margem.",
    moral: "Quando parece que não tem mais saída, Deus abre um caminho onde a gente nem imagina.",
    verse: "Êxodo 14",
  },
  {
    id: "jerico", groupId: "m", emoji: "🎺", title: "A queda dos muros de Jericó",
    text: "A cidade de Jericó tinha muros altíssimos e bem grossos, parecia impossível de conquistar. Deus deu uma instrução bem diferente pro líder Josué: o povo deveria marchar em silêncio ao redor da cidade, uma vez por dia, durante seis dias seguidos, levando a arca sagrada e alguns sacerdotes tocando trombetas. No sétimo dia, o povo marchou sete vezes ao redor da cidade, e depois da última volta, todos os sacerdotes tocaram as trombetas juntos e o povo inteiro gritou bem alto, com toda a força. Naquele instante, os muros gigantes de Jericó desabaram completamente, sem ninguém precisar usar nenhuma arma! O povo de Deus entrou na cidade, mostrando que quando a gente obedece Deus, mesmo que o plano pareça estranho, Ele faz coisas impossíveis acontecerem.",
    moral: "Quando a gente confia e obedece Deus, até os maiores obstáculos podem cair.",
    verse: "Josué 6",
  },
  {
    id: "elias-fogo", groupId: "m", emoji: "🔥", title: "Elias e o fogo do céu",
    text: "Naquela época, muita gente tinha parado de adorar o Deus verdadeiro e estava seguindo ídolos falsos. O profeta Elias desafiou os profetas desses ídolos falsos pra um teste no Monte Carmelo, na frente de todo o povo: cada lado prepararia um altar, e o Deus que respondesse com fogo do céu seria reconhecido como o verdadeiro Deus. Os profetas falsos gritaram e dançaram o dia inteiro, mas nada aconteceu. Na hora de Elias, ele até mandou molhar bem o altar com água, três vezes, pra não ter dúvida nenhuma. Elias orou bem simples, confiando em Deus, e na mesma hora um fogo poderoso desceu do céu e queimou tudo — o altar, a água e até as pedras! Todo o povo, maravilhado, caiu no chão gritando: \"O Senhor é Deus! O Senhor é Deus!\"",
    moral: "Deus é poderoso de verdade, e Ele mostra quem Ele é pra quem confia Nele.",
    verse: "1 Reis 18",
  },
  {
    id: "jonas-ninive", groupId: "m", emoji: "🏙️", title: "Jonas prega em Nínive",
    text: "Deus pediu pro profeta Jonas ir até a grande cidade de Nínive avisar que as pessoas precisavam mudar de vida. Jonas, com medo e sem vontade, fugiu pro lado contrário num barco. No meio do caminho veio uma tempestade tão forte que o barco quase virou, e Jonas acabou caindo no mar. Deus, com cuidado, mandou um peixe enorme engolir Jonas, que ficou protegido na barriga do peixe por três dias, até ter tempo de orar e pedir perdão a Deus. O peixe cuspiu Jonas bem seguro na praia, e dessa vez Jonas foi obediente: caminhou até Nínive e avisou toda a cidade. Pra surpresa de Jonas, o rei e todo o povo de Nínive ouviram, se arrependeram de coração, e Deus perdoou a cidade inteira!",
    moral: "Deus dá muitas oportunidades pra gente obedecer, e Ele se alegra quando alguém muda de vida.",
    verse: "Jonas 1–3",
  },
  {
    id: "torre-babel", groupId: "m", emoji: "🏗️", title: "A Torre de Babel",
    text: "Depois do dilúvio, todas as pessoas do mundo falavam a mesma língua e viviam juntas numa mesma região. Um dia, elas decidiram construir uma cidade com uma torre gigantesca, tão alta que chegasse até o céu, pra ficarem famosas e não se espalharem pela terra como Deus tinha planejado. Deus viu aquele projeto cheio de orgulho e decidiu confundir a língua daquele povo, fazendo com que, de repente, cada grupo começasse a falar um idioma diferente. Sem conseguir se entender mais, os construtores não puderam continuar a obra, e a torre ficou pela metade. As pessoas então se espalharam por toda a terra, formando os diferentes povos e línguas que existem até hoje. Esse lugar ficou conhecido como Babel, que quer dizer \"confusão.\"",
    moral: "Os planos de Deus são sempre melhores que os nossos próprios planos de orgulho e fama.",
    verse: "Gênesis 11:1-9",
  },
  {
    id: "sansao", groupId: "m", emoji: "💪", title: "Sansão, o homem forte",
    text: "Sansão nasceu numa família que dedicou sua vida a Deus desde bebê, e Deus deu a ele uma força física incrível, muito maior que qualquer outro homem. Sansão usava essa força pra proteger o povo de Israel dos inimigos filisteus, fazendo coisas impressionantes, como derrubar um leão só com as mãos. Uma das regras que Sansão precisava seguir era nunca cortar o cabelo, como sinal da sua dedicação a Deus. Só que Sansão se apaixonou por uma mulher chamada Dalila, que foi convencida pelos inimigos a descobrir o segredo da força dele. Depois de insistir bastante, Dalila descobriu o segredo do cabelo e, enquanto Sansão dormia, mandou cortar seus cabelos, fazendo ele perder a força. Mesmo depois desse erro, Deus deu a Sansão uma última chance, e ele usou sua força de volta pra realizar um grande feito final contra os inimigos do povo de Deus.",
    moral: "Os dons que Deus nos dá devem ser usados com responsabilidade e obediência a Ele.",
    verse: "Juízes 13–16",
  },
  {
    id: "ester", groupId: "m", emoji: "👑", title: "Ester salva seu povo",
    text: "Ester era uma jovem judia que, sem esperar, acabou se tornando rainha de um grande império, escondendo que fazia parte do povo de Deus. Um homem poderoso do reino, chamado Hamã, ficou com muito ódio dos judeus e conseguiu que o rei assinasse uma lei terrível, permitindo que todo o povo judeu fosse destruído num certo dia. Mardoqueu, primo de Ester que a tinha criado, pediu pra ela falar com o rei e pedir ajuda pro seu povo, mesmo sendo arriscado entrar na presença do rei sem ser chamada. Ester, com muita coragem, disse: \"Se eu tiver que morrer, que morra\", e decidiu ir falar com o rei mesmo assim, depois de jejuar e orar bastante. O rei recebeu Ester com bondade, e ela, com sabedoria, revelou o plano maligno de Hamã bem na hora certa. O rei cancelou a lei terrível, e o povo de Deus foi salvo, tudo por causa da coragem de uma jovem rainha.",
    moral: "Deus pode usar a coragem de uma só pessoa pra salvar muita, muita gente.",
    verse: "Ester 1–9",
  },
  {
    id: "gideao", groupId: "m", emoji: "🏺", title: "Gideão e os 300 soldados",
    text: "O povo de Israel estava sendo atacado por um exército inimigo enorme, e Deus escolheu um homem chamado Gideão, que se achava fraco e pequeno, pra libertar o povo. Gideão juntou um exército de 32 mil soldados, mas Deus disse que era gente demais — pra ficar bem claro que a vitória viria de Deus, não da força humana. Deus foi diminuindo o exército aos poucos, até sobrar só 300 homens! Com uma estratégia bem diferente, Gideão deu a cada um dos 300 soldados uma trombeta e um jarro de barro escondendo uma tocha acesa. No meio da noite, ao sinal de Gideão, todos os 300 soldados quebraram os jarros ao mesmo tempo, mostrando as tochas acesas, tocaram as trombetas e gritaram bem alto. O exército inimigo, assustado e confuso no escuro, entrou em pânico e fugiu, dando a vitória pro povo de Deus.",
    moral: "Deus não precisa que a gente seja forte ou numeroso — Ele só precisa da nossa obediência e confiança.",
    verse: "Juízes 6–7",
  },
  {
    id: "paralitico", groupId: "m", emoji: "🛏️", title: "Os amigos que desceram pelo telhado",
    text: "Um homem que não conseguia andar tinha quatro amigos muito dedicados, que decidiram levá-lo até Jesus pra ele ser curado. Só que quando chegaram na casa onde Jesus estava ensinando, tinha tanta gente que não conseguiram nem chegar perto da porta. Sem desistir, os quatro amigos tiveram uma ideia criativa: subiram no telhado da casa, abriram um buraco bem no teto, e desceram o amigo paralítico deitado numa maca, bem na frente de Jesus! Jesus, vendo a fé enorme daqueles amigos, disse pro homem que seus pecados estavam perdoados, e depois disse: \"Levante-se, pegue sua maca e vá para casa.\" Na mesma hora, diante de todo mundo, o homem se levantou, andando normalmente, e todos ficaram maravilhados, louvando a Deus por aquele milagre incrível.",
    moral: "A fé de bons amigos pode ajudar a gente a chegar mais perto de Jesus.",
    verse: "Marcos 2:1-12",
  },
  {
    id: "transfiguracao", groupId: "m", emoji: "🌟", title: "A transfiguração de Jesus",
    text: "Jesus levou três discípulos, Pedro, Tiago e João, pra subir com Ele numa montanha bem alta pra orar. Enquanto Jesus orava, algo incrível aconteceu diante dos olhos dos discípulos: o rosto de Jesus começou a brilhar como o sol, e suas roupas ficaram brancas e resplandecentes como a luz. De repente, apareceram dois grandes homens da história do povo de Deus, Moisés e Elias, conversando com Jesus sobre tudo que estava por vir. Pedro, maravilhado e sem saber bem o que dizer, sugeriu construir três tendas ali mesmo pra ficarem. Enquanto ele ainda falava, uma nuvem brilhante os cobriu, e uma voz do céu disse: \"Este é o meu Filho amado, em quem me agrado; ouçam-no.\" Quando a nuvem se foi, só Jesus estava ali com eles, e os discípulos desceram da montanha maravilhados com o que tinham visto.",
    moral: "Jesus é realmente o Filho de Deus, e devemos ouvir e seguir o que Ele ensina.",
    verse: "Mateus 17:1-9",
  },

  // 9–12 anos
  {
    id: "bom-samaritano", groupId: "g", emoji: "🤝", title: "O bom samaritano",
    text: "Um mestre da lei perguntou pra Jesus: \"quem é o meu próximo?\", tentando descobrir até onde ia a obrigação de amar o outro. Jesus respondeu com uma história: um homem estava descendo de Jerusalém pra Jericó quando foi atacado por assaltantes, que bateram nele, roubaram tudo e o deixaram caído na estrada, quase morto. Um sacerdote passou por ali, viu o homem ferido, mas atravessou pro outro lado da estrada e seguiu seu caminho. Um levita, que trabalhava servindo no templo, fez exatamente a mesma coisa. Mas um samaritano — de um povo que os judeus normalmente evitavam — passou por ali, viu o homem ferido e sentiu uma compaixão enorme. Ele parou tudo, cuidou dos ferimentos com óleo e vinho, colocou o homem sobre seu próprio animal, levou até uma hospedaria e ainda pagou pra que continuassem cuidando dele. Jesus perguntou: \"qual desses três foi o próximo daquele homem?\" E disse: \"vá e faça o mesmo.\"",
    moral: "Nosso próximo é qualquer pessoa que precisa de ajuda — não importa de onde ela é ou quem ela é.",
    verse: "Lucas 10:25-37",
  },
  {
    id: "multiplicacao", groupId: "g", emoji: "🍞", title: "Jesus alimenta 5 mil pessoas",
    text: "Uma multidão enorme, com mais de cinco mil pessoas, tinha seguido Jesus até um lugar bem afastado pra ouvir seus ensinamentos e ver os milagres que Ele fazia. Já estava ficando tarde, e os discípulos ficaram preocupados, porque aquele povo todo estava com fome e não tinha nenhum mercado por perto. Filipe calculou que precisariam de muito dinheiro pra comprar comida suficiente pra tanta gente. Foi então que um menino se aproximou e ofereceu tudo que tinha: cinco pãezinhos e dois peixinhos — pouquíssima coisa pra alimentar uma multidão daquele tamanho. Jesus pegou a oferta simples do menino, deu graças a Deus, e começou a repartir. Pra surpresa de todos, a comida não acabava nunca — todo mundo comeu até ficar satisfeito, e ainda sobraram doze cestos cheios de pedaços!",
    moral: "Quando a gente oferece o pouco que tem pra Deus, com um coração generoso, Ele multiplica muito além do que imaginamos.",
    verse: "João 6:1-13",
  },
  {
    id: "zaqueu", groupId: "g", emoji: "🌳", title: "Zaqueu, o coletor de impostos",
    text: "Zaqueu era o chefe dos cobradores de impostos da cidade de Jericó, um trabalho que fazia com que quase todo mundo o odiasse, porque muitos cobradores enganavam o povo pra ficar rico. Quando Zaqueu ouviu que Jesus estava passando pela cidade, ficou curioso pra ver quem era esse homem de quem todos falavam. Só que Zaqueu era baixinho e não conseguia enxergar nada por causa da multidão enorme. Sem se importar com o que os outros pensariam, Zaqueu correu na frente e subiu numa árvore de sicômoro pra conseguir ver Jesus passar. Jesus olhou pra cima, viu Zaqueu escondido entre os galhos, e disse: \"Zaqueu, desça depressa, hoje preciso ficar na sua casa!\" O povo ficou revoltado, achando um absurdo Jesus visitar a casa de um \"pecador\" daqueles. Mas aquele encontro mudou o coração de Zaqueu completamente: ele prometeu devolver quatro vezes mais pra quem tivesse enganado, e dar metade dos seus bens pros pobres.",
    moral: "Jesus enxerga e ama a gente de verdade, não importa o que os outros pensem ou o nosso passado.",
    verse: "Lucas 19:1-10",
  },
  {
    id: "filho-prodigo", groupId: "g", emoji: "🏠", title: "O filho pródigo",
    text: "Um pai tinha dois filhos, e o mais novo pediu pra receber logo a parte da herança que teria direito, mesmo o pai ainda estando vivo — um pedido bem ousado e até desrespeitoso. O pai, mesmo triste, atendeu o pedido, e o filho mais novo foi embora pra bem longe, gastando tudo o que tinha numa vida descuidada e sem responsabilidade. Quando o dinheiro acabou, veio uma fome terrível na região, e o rapaz ficou tão desesperado que arrumou um trabalho cuidando de porcos, comendo quase a mesma comida que os bichos. Foi ali, no fundo do poço, que ele caiu em si e pensou: \"até os empregados lá em casa vivem melhor que eu, vou voltar e pedir perdão ao meu pai.\" Ele voltou pra casa, ensaiando um pedido de desculpas, mas de longe o pai já o viu chegando e correu ao encontro dele, abraçando e beijando o filho antes mesmo dele terminar de falar. O pai organizou uma festa enorme, dizendo: \"meu filho estava morto e voltou a viver, estava perdido e foi encontrado!\"",
    moral: "Não importa o quanto a gente se afaste, o amor de Deus está sempre pronto pra nos receber de volta.",
    verse: "Lucas 15:11-32",
  },
  {
    id: "paulo-conversao", groupId: "g", emoji: "✨", title: "A conversão de Paulo",
    text: "Paulo, que naquela época se chamava Saulo, era um homem que perseguia com muita raiva os primeiros cristãos, achando que estava defendendo a verdade. Um dia, indo pela estrada até a cidade de Damasco, cheio de planos de prender mais cristãos, uma luz forte do céu de repente brilhou ao redor dele, e Saulo caiu no chão. Ele ouviu uma voz dizendo: \"Saulo, Saulo, por que você está me perseguindo?\" Era a voz de Jesus! Saulo, tremendo, perguntou quem estava falando, e a resposta o deixou sem chão: era exatamente quem ele tanto perseguia. Depois daquele encontro, Saulo ficou cego por três dias, até que um discípulo chamado Ananias, mesmo com medo, foi orar por ele e Deus devolveu sua visão. A partir dali, Saulo, que passou a ser chamado de Paulo, se tornou um dos maiores anunciadores da mensagem de Jesus em todo o mundo conhecido.",
    moral: "Deus pode transformar completamente até a pessoa que a gente menos espera, incluindo a gente mesmo.",
    verse: "Atos 9:1-19",
  },
  {
    id: "ressurreicao", groupId: "g", emoji: "🌅", title: "A ressurreição de Jesus",
    text: "Depois de Jesus morrer na cruz, seu corpo foi colocado num túmulo, e uma pedra enorme foi rolada na frente da entrada pra fechar tudo. Os discípulos ficaram tristes e com medo, achando que tinham perdido pra sempre a esperança que tinham colocado em Jesus. No domingo de manhã, bem cedinho, algumas mulheres foram até o túmulo levando perfumes, mas quando chegaram, viram que a pedra enorme já tinha sido removida! Um anjo apareceu e disse: \"Por que vocês procuram entre os mortos aquele que está vivo? Ele não está aqui, ressuscitou, exatamente como Ele tinha dito!\" As mulheres saíram correndo, cheias de espanto e alegria, pra contar a notícia aos discípulos. Depois, Jesus mesmo apareceu vivo pra muita gente, comeu com os discípulos e mostrou as marcas em suas mãos, provando que realmente tinha vencido a morte.",
    moral: "Jesus venceu a morte, e essa é a maior prova de que Ele tem poder sobre tudo, inclusive sobre a nossa vida.",
    verse: "Lucas 24 / João 20",
  },
  {
    id: "pentecostes", groupId: "g", emoji: "🕊️", title: "O Espírito Santo em Pentecostes",
    text: "Antes de subir aos céus, Jesus tinha prometido aos discípulos que enviaria o Espírito Santo pra estar com eles pra sempre, dando força e coragem. Os discípulos ficaram reunidos, orando juntos, esperando essa promessa se cumprir. De repente, num dia de festa chamado Pentecostes, veio do céu um som parecido com um vento forte, que encheu toda a casa onde eles estavam. Apareceram línguas que pareciam de fogo, pousando sobre cada um deles, e todos foram cheios do Espírito Santo. Um milagre incrível aconteceu: eles começaram a falar em outros idiomas, e pessoas de várias nações que estavam ali entendiam cada palavra na sua própria língua! Pedro, que antes tinha até negado conhecer Jesus por medo, ficou tão corajoso que pregou pra multidão, e naquele dia, milhares de pessoas creram e decidiram seguir Jesus.",
    moral: "O Espírito Santo dá coragem e força pra gente viver e anunciar o amor de Deus, mesmo quando temos medo.",
    verse: "Atos 2",
  },
  {
    id: "davi-saul", groupId: "g", emoji: "🗡️", title: "Davi poupa a vida de Saul",
    text: "O rei Saul, cheio de inveja e medo de perder seu trono, começou a perseguir Davi por muitos anos, tentando prendê-lo, mesmo Davi nunca tendo feito nada de errado contra ele. Numa noite, Davi e seus homens encontraram Saul dormindo profundamente numa caverna, completamente indefeso, bem na frente deles. Os homens de Davi disseram: \"essa é a sua chance, Deus colocou seu inimigo nas suas mãos!\" Mas Davi, mesmo podendo se vingar facilmente, recusou-se a machucar o rei, dizendo que não era certo levantar a mão contra alguém que Deus tinha escolhido pra governar. Davi apenas cortou um pedacinho da capa de Saul, como prova de que poderia tê-lo alcançado, mas não quis. Depois, de uma distância segura, Davi mostrou o pedaço da capa pra Saul, provando sua lealdade e seu coração de perdão, o que deixou o próprio rei emocionado e reconhecendo que Davi era melhor do que ele.",
    moral: "Confiar em Deus significa também saber esperar por Ele, em vez de se vingar por conta própria.",
    verse: "1 Samuel 24",
  },
  {
    id: "salomao-sabedoria", groupId: "g", emoji: "🧠", title: "Salomão pede sabedoria",
    text: "Quando Salomão se tornou rei de Israel, ainda bem jovem, ele sabia que tinha uma responsabilidade enorme pela frente. Numa noite, Deus apareceu pra ele num sonho e disse: \"Peça o que você quiser, e eu darei a você.\" A maioria das pessoas talvez pedisse riquezas, fama ou uma vida longa, mas Salomão pediu algo diferente: um coração sábio, capaz de entender e governar bem o povo de Deus. Deus ficou tão contente com esse pedido que não só deu a Salomão uma sabedoria incrível, maior que a de qualquer outra pessoa, como também lhe deu riquezas e honra, mesmo sem ele ter pedido. Com o tempo, a fama da sabedoria de Salomão se espalhou por muitos reinos, e pessoas de terras distantes viajavam só pra ouvir os conselhos sábios que ele dava. Salomão usou essa sabedoria pra julgar com justiça e construir um templo lindo dedicado a Deus.",
    moral: "Quando a gente busca primeiro o que realmente importa pra Deus, Ele cuida do resto também.",
    verse: "1 Reis 3",
  },
  {
    id: "job", groupId: "g", emoji: "🙏", title: "Jó permanece fiel",
    text: "Jó era um homem que amava profundamente a Deus, e tinha uma família grande, muitos bens e uma vida cheia de bênçãos. Só que, num período muito difícil, Jó perdeu quase tudo que tinha: seus animais, sua riqueza, e até seus filhos, um atrás do outro, além de ficar gravemente doente. Seus amigos vieram visitá-lo, mas em vez de consolar, ficaram tentando explicar por que aquilo estava acontecendo, achando que Jó tinha feito algo de muito errado. Mesmo sem entender o motivo de tanto sofrimento, Jó continuou confiando em Deus, dizendo: \"O Senhor deu, e o Senhor tirou; bendito seja o nome do Senhor.\" Depois de um longo tempo, Deus finalmente falou com Jó, mostrando o quão grande e sábio Ele é, muito além do que qualquer pessoa consegue compreender totalmente. No final, Deus abençoou Jó ainda mais do que antes, restaurando tudo que ele tinha perdido.",
    moral: "Mesmo quando não entendemos o motivo do sofrimento, podemos continuar confiando que Deus é bom.",
    verse: "Jó 1–42",
  },
  {
    id: "dez-mandamentos", groupId: "g", emoji: "📜", title: "Moisés recebe os dez mandamentos",
    text: "Depois que o povo de Deus saiu do Egito, eles viajaram pelo deserto até chegar num monte chamado Sinai. Deus chamou Moisés pra subir até o topo da montanha, e ali, em meio a trovões, relâmpagos e uma nuvem espessa, Deus falou com Moisés e deu a ele dez leis importantes pra guiar a vida do povo — os Dez Mandamentos. Essas leis ensinavam o povo a amar a Deus acima de tudo, a não ter outros ídolos, a descansar num dia da semana, a honrar os pais, e a tratar bem uns aos outros, sem mentir, roubar ou invejar o que não era seu. Deus escreveu esses mandamentos em duas tábuas de pedra, com seu próprio poder. Quando Moisés desceu da montanha e mostrou as tábuas ao povo, todos prometeram seguir aquelas leis, porque entenderam que eram um presente de Deus pra ajudá-los a viver bem e em paz uns com os outros.",
    moral: "As regras de Deus não são pra nos prender, mas pra nos ensinar a viver com amor e respeito.",
    verse: "Êxodo 19–20",
  },
  {
    id: "ultima-ceia", groupId: "g", emoji: "🍞", title: "A última ceia",
    text: "Pouco antes de ser preso, Jesus se reuniu com seus doze discípulos numa sala pra celebrar uma refeição especial, chamada de última ceia. Durante o jantar, Jesus surpreendeu todo mundo ao se levantar, pegar uma bacia com água e começar a lavar os pés de cada discípulo — uma tarefa que normalmente era feita pelos servos mais humildes. Depois, Jesus pegou o pão, deu graças, partiu em pedaços e disse: \"Isto é o meu corpo, entregue por vocês; façam isto em memória de mim.\" Em seguida, pegou um cálice de vinho e disse: \"Este cálice é a nova aliança no meu sangue, derramado por vocês.\" Jesus estava explicando, de um jeito simples e profundo, que Ele ia entregar sua vida por amor a todos. Aquela refeição se tornou um dos momentos mais lembrados por todos que seguem Jesus até hoje, celebrado em igrejas ao redor do mundo inteiro.",
    moral: "Jesus nos ensinou que amar de verdade é estar disposto a servir e se entregar pelo outro.",
    verse: "Mateus 26:17-30 / Lucas 22:7-20",
  },
  {
    id: "maria-marta", groupId: "g", emoji: "🏡", title: "Maria e Marta",
    text: "Jesus era muito próximo de uma família formada por duas irmãs, Marta e Maria, e um irmão chamado Lázaro, que moravam numa cidade chamada Betânia. Numa visita, Marta ficou correndo de um lado pro outro, ocupadíssima preparando tudo pra receber Jesus muito bem em sua casa. Enquanto isso, Maria, sua irmã, simplesmente sentou aos pés de Jesus, prestando atenção em cada palavra que Ele ensinava. Marta, cansada e um pouco frustrada, foi até Jesus e perguntou: \"Não se importa que minha irmã me deixou fazer tudo sozinha? Diga a ela para me ajudar.\" Jesus respondeu com gentileza: \"Marta, Marta, você anda ansiosa e preocupada com tantas coisas, mas só uma é realmente necessária, e Maria escolheu a parte boa, que não lhe será tirada.\" Jesus não estava dizendo que trabalhar era errado, mas que passar tempo aprendendo e estando perto Dele é o mais importante de tudo.",
    moral: "No meio da correria da vida, separar um tempo pra estar perto de Deus é sempre a melhor escolha.",
    verse: "Lucas 10:38-42",
  },
  {
    id: "armadura-de-deus", groupId: "g", emoji: "🛡️", title: "A armadura de Deus",
    text: "O apóstolo Paulo, escrevendo uma carta pra igreja de Éfeso, usou uma comparação muito interessante pra explicar como a vida cristã pode ser como uma batalha espiritual. Ele disse que devemos nos vestir com toda a armadura de Deus, pra ficar firmes contra as dificuldades que enfrentamos. Paulo descreveu cada peça: o cinturão da verdade, apertado firme na cintura; a couraça da justiça, protegendo o coração; os pés calçados com a disposição de anunciar o evangelho da paz; o escudo da fé, capaz de apagar as flechas do mal; o capacete da salvação, protegendo a mente; e a espada do Espírito, que é a Palavra de Deus. Paulo também lembrou da importância de orar sempre, em todas as ocasiões, pedindo força a Deus. Assim como um soldado bem equipado enfrenta a batalha com confiança, um cristão bem preparado com a Palavra de Deus e a oração pode enfrentar qualquer dificuldade com coragem.",
    moral: "Deus nos dá tudo que precisamos — verdade, fé, paz e sua Palavra — pra enfrentarmos os desafios da vida.",
    verse: "Efésios 6:10-18",
  },
];

// Escolhe a história do dia por turma, trocando todo dia (mesmo conteúdo
// o dia inteiro pra todo mundo, sem precisar guardar isso em lugar nenhum).
export function todaysStoryFor(groupId) {
  const stories = BIBLE_STORIES.filter(s => s.groupId === groupId);
  if (stories.length === 0) return null;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return stories[dayOfYear % stories.length];
}
