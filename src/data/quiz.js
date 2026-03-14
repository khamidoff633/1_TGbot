module.exports = {
  javascript: [
    {
      question: 'JavaScriptda closure nimani anglatadi?',
      options: [
        'Function faqat global variablelarni ko‘ra olishi',
        'Inner function outer scope variablelariga kira olishi',
        'Object ichida method bo‘lishi',
        'Array methodlari bilan ishlash'
      ],
      answerIndex: 1,
      explanation: 'Closure — ichki function tashqi function scope’iga murojaat qila olishi.'
    },
    {
      question: 'Array ichidan birinchi mos elementni topish uchun qaysi method to‘g‘ri?',
      options: ['map', 'filter', 'find', 'reduce'],
      answerIndex: 2,
      explanation: 'find() birinchi mos elementni qaytaradi.'
    },
    {
      question: 'Promise.all qachon reject bo‘ladi?',
      options: [
        'Barcha promise resolve bo‘lganda',
        'Hech qachon reject bo‘lmaydi',
        'Biror promise reject bo‘lsa',
        'Faqat oxirgi promise reject bo‘lsa'
      ],
      answerIndex: 2,
      explanation: 'Promise.all ichida bitta promise reject bo‘lsa ham umumiy natija reject bo‘ladi.'
    },
    {
      question: 'Optional chaining qaysi yozuvda to‘g‘ri?',
      options: ['user->name', 'user?.name', 'user??name', 'user.?name'],
      answerIndex: 1,
      explanation: 'Optional chaining: obj?.prop shaklida yoziladi.'
    }
  ],
  nodejs: [
    {
      question: 'Node.js asosan qaysi engine ustida ishlaydi?',
      options: ['SpiderMonkey', 'V8', 'Java VM', 'WebKit'],
      answerIndex: 1,
      explanation: 'Node.js Google V8 engine’dan foydalanadi.'
    },
    {
      question: 'Express middleware nima qiladi?',
      options: [
        'Faqat database yaratadi',
        'Request va response oralig‘ida logika bajaradi',
        'Faqat frontend render qiladi',
        'Serverni o‘chiradi'
      ],
      answerIndex: 1,
      explanation: 'Middleware — request/response pipeline ichidagi funksiya.'
    },
    {
      question: 'process.env nimaga kerak?',
      options: [
        'CSS yozish uchun',
        'Environment variable o‘qish uchun',
        'Database yaratish uchun',
        'File upload uchun'
      ],
      answerIndex: 1,
      explanation: 'process.env orqali token, port, secret kabi env variablelar olinadi.'
    },
    {
      question: 'Webhook rejimi pollingdan nimasi bilan farq qiladi?',
      options: [
        'Webhook xabarlarni push qiladi',
        'Polling push qiladi',
        'Ikkalasi bir xil',
        'Webhook faqat frontendda ishlaydi'
      ],
      answerIndex: 0,
      explanation: 'Webhook — Telegram update’ni serverga yuboradi. Polling esa botning o‘zi tekshiradi.'
    }
  ],
  sql: [
    {
      question: 'SQLda barcha yozuvlarni olish uchun qaysi komanda ishlatiladi?',
      options: ['GET ALL FROM users', 'SELECT * FROM users', 'SHOW users ALL', 'FETCH users'],
      answerIndex: 1,
      explanation: 'Standart sintaksis: SELECT * FROM table_name.'
    },
    {
      question: 'JOIN nimaga ishlatiladi?',
      options: [
        'Ikki yoki undan ortiq jadvalni bog‘lash uchun',
        'Database o‘chirish uchun',
        'Column nomini o‘zgartirish uchun',
        'Serverni restart qilish uchun'
      ],
      answerIndex: 0,
      explanation: 'JOIN bog‘langan jadvallardan birgalikda ma’lumot olish uchun kerak.'
    }
  ],
  backend: [
    {
      question: 'REST API da POST odatda nima uchun ishlatiladi?',
      options: ['Delete qilish', 'Update qilish', 'Yangi resurs yaratish', 'Faqat list olish'],
      answerIndex: 2,
      explanation: 'POST ko‘pincha yangi ma’lumot yaratishda ishlatiladi.'
    },
    {
      question: 'HTTP 401 nimani bildiradi?',
      options: ['Not found', 'Unauthorized', 'Server error', 'Created'],
      answerIndex: 1,
      explanation: '401 — autentifikatsiya kerak yoki token noto‘g‘ri.'
    }
  ]
};
