const client = require("../config/redisClient");
const twoWeeks = 1000 * 60 * 60 * 24 * 14;
const filterAndValidateToken = async (token, userName) => {
  const tokensArr = JSON.parse(await client.get("tokens"));
  const newTokensArr = tokensArr.filter(
    (i) => new Date().valueOf() - i.issuedAt < twoWeeks
  );

  await client.set("tokens", JSON.stringify(newTokensArr));

  const exist = tokensArr.find((i) => i.token === token);
  const used = tokensArr.find(
    (i) => i.userName !== userName && i.token === token
  );

  if (!exist || used) return 0;

  return 1;
};

module.exports = filterAndValidateToken;
