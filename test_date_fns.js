const { format } = require('date-fns');
const { pl } = require('date-fns/locale');
console.log(format(new Date(), 'yyyy-MM-dd', { locale: pl }));
