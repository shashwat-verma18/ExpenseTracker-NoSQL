const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

dotenv.config();

const userRoute = require('./routes/userRoutes');
// const expenseRoute = require('./routes/expenseRoutes');
// const purchaseRoute = require('./routes/premiumRoutes');

app.use(cors());
app.use(bodyParser.json({ extended: false }));

app.use('/users', userRoute);
// app.use('/expense', expenseRoute);
// app.use('/purchase', purchaseRoute);


mongoose
  .connect('mongodb+srv://shashwat:Shashwat.18@cluster0.0e1s0wd.mongodb.net/expense?retryWrites=true')
  .then(result => {
    app.listen(4000);
  })
  .catch(err => console.log(err));

