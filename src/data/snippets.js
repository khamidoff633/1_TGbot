module.exports = {
  'binary search': `function binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n\n  return -1;\n}`,
  'fizzbuzz': `for (let i = 1; i <= 100; i++) {\n  if (i % 15 === 0) console.log('FizzBuzz');\n  else if (i % 3 === 0) console.log('Fizz');\n  else if (i % 5 === 0) console.log('Buzz');\n  else console.log(i);\n}`,
  'debounce': `function debounce(fn, delay = 300) {\n  let timeout;\n  return (...args) => {\n    clearTimeout(timeout);\n    timeout = setTimeout(() => fn(...args), delay);\n  };\n}`,
  'express error middleware': `function errorHandler(err, req, res, next) {\n  console.error(err);\n  return res.status(err.status || 500).json({\n    message: err.message || 'Internal Server Error'\n  });\n}`,
  'jwt auth middleware': `const jwt = require('jsonwebtoken');\n\nfunction auth(req, res, next) {\n  try {\n    const token = req.headers.authorization?.split(' ')[1];\n    if (!token) return res.status(401).json({ message: 'Token required' });\n\n    req.user = jwt.verify(token, process.env.JWT_SECRET);\n    next();\n  } catch (error) {\n    return res.status(401).json({ message: 'Invalid token' });\n  }\n}`
};
