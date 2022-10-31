require("dotenv").config();
const { createClient } = require("redis");
const url = (process.env.NODE_ENV === 'PRODUCTION'?process.env.REDIS_URL:'redis://localhost:6379');
let client = createClient({url});

(async ()=>{
  client.on('connect',()=>console.log(`Redis Client is Connected to ${url}`));
  client.on('error', (err) => console.log('Redis Client Error', err));
  await client.connect();
})();

module.exports = client;