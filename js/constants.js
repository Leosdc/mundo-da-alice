const API_URL = 'https://script.google.com/macros/s/AKfycbzYO5iizLJ-i-NKetEqIHTpphjBY4zo-NV4F5DOmbJL8MGbRm2G_O95G1Wk8UUNj2sP/exec';

const bookQuotes = [
    { quote: "Só se vê bem com o coração. O essencial é invisível aos olhos.", book: "O Pequeno Príncipe" },
    { quote: "Pode dizer-me, por favor, que caminho devo seguir para sair daqui? Isso depende muito de para onde você quer ir.", book: "Alice no País das Maravilhas" },
    { quote: "Você é mais corajoso do que acredita, mais forte do que parece e mais inteligente do que pensa.", book: "O Ursinho Pooh" },
    { quote: "Mesmo as menores pessoas podem mudar o curso do futuro.", book: "O Senhor dos Anéis" },
    { quote: "Existem muitos tipos de coragem. É preciso muita coragem para enfrentar nossos inimigos, mas igual coragem para enfrentar nossos amigos.", book: "Harry Potter e a Pedra Filosofal" },
    { quote: "As palavras são, na minha nada humilde opinião, nossa fonte mais inesgotável de magia.", book: "Harry Potter e as Relíquias da Morte" },
    { quote: "O mundo é, de fato, cheio de perigos, e nele há muitos lugares sombrios; mas ainda assim há muita coisa que é justa.", book: "O Senhor dos Anéis" },
    { quote: "A felicidade pode ser encontrada mesmo nas horas mais difíceis, se você se lembrar de acender a luz.", book: "Harry Potter e o Prisioneiro de Azkaban (Filme)" },
    { quote: "Tudo o que temos de decidir é o que fazer com o tempo que nos é dado.", book: "O Senhor dos Anéis" },
    { quote: "Não são nossas habilidades que mostram quem realmente somos. São nossas escolhas.", book: "Harry Potter e a Câmara Secreta" },
    { quote: "Afinal, amanhã é outro dia.", book: "E o Vento Levou" },
    { quote: "Ser ou não ser, eis a questão.", book: "Hamlet" },
    { quote: "O amor não consiste em olhar um para o outro, mas sim em olhar juntos na mesma direção.", book: "O Pequeno Príncipe" },
    { quote: "Eu sou eu e minha circunstância, e se não salvo a ela, não salvo a mim.", book: "Meditações do Quixote (José Ortega y Gasset)" },
    { quote: "Viver é a coisa mais rara do mundo. A maioria das pessoas apenas existe.", book: "O Retrato de Dorian Gray" },
    { quote: "Há sempre flores para aqueles que querem vê-las.", book: "Henri Matisse (frequentemente associado ao Pequeno Príncipe)" },
    { quote: "É uma verdade universalmente conhecida que um homem solteiro possuidor de uma boa fortuna deve estar necessitado de uma esposa.", book: "Orgulho e Preconceito" },
    { quote: "O tempo você não recupera jamais. Por isso, não perca o seu.", book: "Momo" },
    { quote: "Não há nada melhor que um amigo, a não ser um amigo com chocolate.", book: "Linda Grayson" },
    { quote: "Quem olha para fora, sonha. Quem olha para dentro, desperta.", book: "Carl Jung" },
    { quote: "O medo de um nome só aumenta o medo da própria coisa.", book: "Harry Potter e a Pedra Filosofal" },
    { quote: "A verdade é como o Sol. Você pode fechá-la por um tempo, mas ela não vai embora.", book: "Elvis Presley" },
    { quote: "Duas estradas se bifurcavam num bosque, e eu escolhi a menos percorrida.", book: "The Road Not Taken (Robert Frost)" },
    { quote: "Toda grande história começa com uma viagem.", book: "O Hobbit" },
    { quote: "Você nunca é velho demais para colocar um objetivo novo ou sonhar um novo sonho.", book: "C.S. Lewis" },
    { quote: "Nós aceitamos o amor que achamos que merecemos.", book: "As Vantagens de Ser Invisível" },
    { quote: "Nunca deixe que ninguém lhe diga que você não pode fazer algo. Nem mesmo eu.", book: "À Procura da Felicidade" },
    { quote: "Algumas vezes as perguntas são complicadas e as respostas são simples.", book: "Dr. Seuss" },
    { quote: "E se eu cair? Oh, mas querida, e se você voar?", book: "Erin Hanson" },
    { quote: "A melhor maneira de realizar o impossível é acreditar que é possível.", book: "Alice no País das Maravilhas (Filme)" },
    { quote: "Aventura está lá fora!", book: "Up: Altas Aventuras" },
    { quote: "Ohana significa família. Família significa que ninguém fica para trás.", book: "Lilo & Stitch" },
    { quote: "Você é mais do que aquilo que se tornou.", book: "O Rei Leão" },
    { quote: "O passado pode doer, mas você pode fugir dele ou aprender com ele.", book: "O Rei Leão" },
    { quote: "Às vezes, as menores coisas ocupam mais espaço no seu coração.", book: "O Ursinho Pooh" },
    { quote: "O medo é a mente que mata. É a pequena morte que traz obliteração total.", book: "Duna" },
    { quote: "Eu me importo muito em não saber um monte de coisas.", book: "A Culpa é das Estrelas" }
];

const statusOptions = {
    'Livro': ['Quero ler', 'Lendo', 'Lido', 'Desisti'],
    'Série': ['Quero assistir', 'Assistindo', 'Assistido', 'Desisti'],
    'Filme': ['Quero assistir', 'Assistindo', 'Assistido', 'Desisti']
};
const ratingOptions = ['Maravilhoso 😍', 'Muito bom 😊', 'Bom 🙂', 'Mais ou menos 🤨', 'Ruim 🙁', 'Péssimo 😒'];
const categoryOptions = ['Livro', 'Série', 'Filme'];
const countryOptions = [
    'Brasil', 'Afeganistão', 'África do Sul', 'Albânia', 'Alemanha', 'Andorra', 'Angola', 'Arábia Saudita',
    'Argélia', 'Argentina', 'Armênia', 'Austrália', 'Áustria', 'Azerbaijão', 'Bahamas', 'Bangladesh',
    'Barbados', 'Bahrein', 'Bélgica', 'Belize', 'Benim', 'Bielorrússia', 'Bolívia', 'Bósnia e Herzegovina',
    'Botsuana', 'Brunei', 'Bulgária', 'Burquina Faso', 'Burundi', 'Butão', 'Cabo Verde', 'Camarões',
    'Camboja', 'Canadá', 'Catar', 'Cazaquistão', 'Chade', 'Chile', 'China', 'Chipre', 'Colômbia',
    'Comores', 'Congo-Brazzaville', 'Coreia do Norte', 'Coreia do Sul', 'Costa do Marfim', 'Costa Rica',
    'Croácia', 'Cuba', 'Dinamarca', 'Djibuti', 'Dominica', 'Egito', 'El Salvador', 'Emirados Árabes Unidos',
    'Equador', 'Eritreia', 'Eslováquia', 'Eslovênia', 'Espanha', 'Estado da Palestina', 'Estados Unidos',
    'Estônia', 'Etiópia', 'Fiji', 'Filipinas', 'Finlândia', 'França', 'Gabão', 'Gâmbia', 'Gana',
    'Geórgia', 'Granada', 'Grécia', 'Guatemala', 'Guiana', 'Guiné', 'Guiné Equatorial', 'Guiné-Bissau',
    'Haiti', 'Honduras', 'Hungria', 'Iêmen', 'Ilhas Cook', 'Ilhas Marshall', 'Ilhas Salomão', 'Índia',
    'Indonésia', 'Irã', 'Iraque', 'Irlanda', 'Islândia', 'Israel', 'Itália', 'Jamaica', 'Japão',
    'Jordânia', 'Kiribati', 'Kuwait', 'Laos', 'Lesoto', 'Letônia', 'Líbano', 'Libéria', 'Líbia',
    'Listenstaine', 'Lituânia', 'Luxemburgo', 'Macedônia do Norte', 'Madagascar', 'Malásia', 'Malaui',
    'Maldivas', 'Mali', 'Malta', 'Marrocos', 'Maurícia', 'Mauritânia', 'México', 'Mianmar', 'Micronésia',
    'Moçambique', 'Moldávia', 'Mónaco', 'Mongólia', 'Montenegro', 'Namíbia', 'Nauru', 'Nepal',
    'Nicarágua', 'Níger', 'Nigéria', 'Niue', 'Noruega', 'Nova Zelândia', 'Omã', 'Países Baixos', 'Palau',
    'Panamá', 'Papua-Nova Guiné', 'Paquistão', 'Paraguai', 'Peru', 'Polônia', 'Portugal', 'Quênia',
    'Quirguistão', 'Reino Unido', 'República Centro-Africana', 'República Checa', 'República Democrática do Congo',
    'República Dominicana', 'Romênia', 'Ruanda', 'Rússia', 'Samoa', 'Santa Lúcia', 'São Cristóvão e Neves',
    'São Marinho', 'São Tomé e Príncipe', 'São Vicente e Granadinas', 'Seicheles', 'Senegal', 'Serra Leoa',
    'Sérvia', 'Singapura', 'Síria', 'Somália', 'Sri Lanka', 'Suazilândia', 'Sudão', 'Sudão do Sul', 'Suécia',
    'Suíça', 'Suriname', 'Tailândia', 'Taiwan', 'Tajiquistão', 'Tanzânia', 'Timor-Leste', 'Togo', 'Tonga',
    'Trindade e Tobago', 'Tunísia', 'Turquemenistão', 'Turquia', 'Tuvalu', 'Ucrânia', 'Uganda', 'Uruguai',
    'Usbequistão', 'Vanuatu', 'Vaticano', 'Venezuela', 'Vietname', 'Zâmbia', 'Zimbábue', 'Outro'
];

const firebaseConfig = {
    apiKey: "AIzaSyA177h7yrtUUeM0T1jaCx0ElaXlfTBbScA",
    authDomain: "another-level-solutions.firebaseapp.com",
    projectId: "another-level-solutions",
    storageBucket: "another-level-solutions.firebasestorage.app",
    messagingSenderId: "88107993655",
    appId: "1:88107993655:web:c6909b8d96813d528863f2",
    measurementId: "G-QCBWH6MCVF"
};

export {
    API_URL,
    bookQuotes,
    statusOptions,
    ratingOptions,
    categoryOptions,
    countryOptions,
    firebaseConfig
};
