const { v4: uuidv4 } = require("uuid");

const generateUserId = (name) => {

  const cleanName = name
    .replace(/\s+/g, "")
    .substring(0, 4)
    .toUpperCase();

  const random = uuidv4()
    .replace(/-/g, "")
    .substring(0, 4)
    .toUpperCase();

  return `${cleanName}_${random}`;
};

module.exports = generateUserId;