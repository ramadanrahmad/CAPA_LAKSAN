const dns = require('dns');
dns.lookup('smtp.gmail.com', { family: 4 }, (err, address) => {
  console.log('IPv4 address for smtp.gmail.com:', address);
});
