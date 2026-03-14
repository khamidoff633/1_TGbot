module.exports = {
  backend: [
    {
      question: 'REST API va GraphQL o‘rtasidagi asosiy farq nima?',
      options: [
        'REST faqat frontend uchun',
        'GraphQL bir endpoint orqali kerakli fieldlarni aniq so‘rashga imkon beradi',
        'REST database turi',
        'GraphQL HTTP ishlatmaydi'
      ],
      answerIndex: 1,
      explanation: 'GraphQL clientga kerakli fieldlarni aniq tanlash imkonini beradi. REST esa ko‘pincha bir nechta endpointlarga ega bo‘ladi.'
    },
    {
      question: 'Idempotent method qaysi?',
      options: ['POST', 'PATCH', 'GET', 'CONNECT'],
      answerIndex: 2,
      explanation: 'GET idempotent. Bir necha marta ishlatilsa ham server holatini o‘zgartirmaydi.'
    },
    {
      question: 'Rate limiting nima uchun kerak?',
      options: ['Dizayn uchun', 'So‘rovlarni cheklab abuse va loadni kamaytirish uchun', 'Faqat SQL uchun', 'Faqat frontend uchun'],
      answerIndex: 1,
      explanation: 'Rate limiting serverni spam va abuse’dan himoya qiladi.'
    }
  ],
  javascript: [
    {
      question: 'Event loop nimani boshqaradi?',
      options: ['Database queryni saqlaydi', 'Async callback va tasklarni navbat bilan bajarishni', 'CSS ni', 'HTTP kodlarini'],
      answerIndex: 1,
      explanation: 'Event loop async tasklar bajarilish navbatini boshqaradi.'
    },
    {
      question: '== va === farqi nima?',
      options: ['Farqi yo‘q', '=== type coercion qilmaydi', '== tezroq', '=== faqat numberlar uchun'],
      answerIndex: 1,
      explanation: '=== qat’iy tenglikni tekshiradi, type coercion qilmaydi.'
    },
    {
      question: 'Debounce qayerda foydali?',
      options: ['Input search', 'Database migrate', 'JWT create', 'Table create'],
      answerIndex: 0,
      explanation: 'Debounce input search, resize, scroll kabi tez-tez bo‘ladigan eventlarda foydali.'
    }
  ],
  nodejs: [
    {
      question: 'Cluster mode nimaga kerak?',
      options: ['CSS yig‘ish uchun', 'Ko‘p CPU corelardan foydalanish uchun', 'DB backup uchun', 'Webhook ulash uchun'],
      answerIndex: 1,
      explanation: 'Cluster mode Node.js appni bir nechta process bilan ishlatib ko‘p core’dan foydalanishga yordam beradi.'
    },
    {
      question: 'Streams qachon foydali?',
      options: ['Katta fayl o‘qishda', 'Faqat authda', 'Faqat SQLda', 'Faqat frontendda'],
      answerIndex: 0,
      explanation: 'Streams katta fayl va data flowlarni xotirani tejab qayta ishlashda juda foydali.'
    }
  ]
};
