const patterns = [
  {
    regex: /cannot read properties of undefined|undefined/i,
    title: 'Undefined obyektga murojaat qilinyapti',
    fix: [
      'Qaysi variable undefined bo‘layotganini console.log bilan tekshir.',
      'Optional chaining (`obj?.name`) yoki early return ishlat.',
      'Data API yoki req.body dan kelyaptimi, validate qil.'
    ]
  },
  {
    regex: /sequelize\.define is not a function/i,
    title: 'Sequelize instance noto‘g‘ri import qilingan',
    fix: [
      'sequelize objectni configdan to‘g‘ri export/import qil.',
      'Model faylida `const sequelize = require(...)` haqiqiy instance ekanini tekshir.',
      'Agar `new Sequelize(...)` qilinmagan bo‘lsa, avval init qil.'
    ]
  },
  {
    regex: /eaddrinuse|address already in use/i,
    title: 'Port band',
    fix: [
      'Oldingi server processni to‘xtat.',
      'Boshqa PORT tanla.',
      'Mac/Linuxda `lsof -i :PORT` bilan tekshir.'
    ]
  },
  {
    regex: /no open ports detected/i,
    title: 'Hosting port topmadi',
    fix: [
      '`app.listen(process.env.PORT)` ishlatayotganingni tekshir.',
      'Web service uchun express health route qo‘sh.',
      'Background worker va web service farqini tekshir.'
    ]
  },
  {
    regex: /jwt|token/i,
    title: 'Auth/JWT muammosi',
    fix: [
      'SECRET bir xil ekanini tekshir.',
      'Token header ichida `Bearer <token>` formatda ketayotganini ko‘r.',
      'Expiration va verify qismidagi xatolarni console bilan tahlil qil.'
    ]
  }
];

function analyzeBug(message = '') {
  const match = patterns.find((item) => item.regex.test(message));
  if (match) return match;

  return {
    title: 'Umumiy debugging yo‘riqnomasi',
    fix: [
      'Error stack qaysi fayl va qatorda chiqqanini top.',
      'Kirish ma’lumotlarini console.log bilan tekshir.',
      'Oxirgi o‘zgartirgan joyingni vaqtincha qaytarib ko‘r.',
      'Minimal reproduksiya yaratib xatoni ajrat.'
    ]
  };
}

module.exports = { analyzeBug };
