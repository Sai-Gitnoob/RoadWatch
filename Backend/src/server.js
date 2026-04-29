require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


const { db } = require("./config/firebase");

db.collection("test").add({ working: true })
  .then(() => console.log("Firebase connected"))
  .catch(console.error);