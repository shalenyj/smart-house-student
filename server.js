const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();

const db = require('./app/db');

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

(async() => {
  try{
    await db(url);
    require('./app/routes/index')(app);
    app.listen(process.env.PORT, () => {
      console.log(`We live at ${process.env.PORT}`);
    });
  } catch(err){
    console.log('Error while connecting to db', err);
  }
})();
