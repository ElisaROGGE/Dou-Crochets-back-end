const express = require('express')
const serverConfig = require('./app/config/server.config')
const cors = require('cors')
const mongoose = require("mongoose");
const BddCreate = require('./app/scripts/createBdd.script') 
const path = require('path')
const job = require('./app/scripts/cron')
const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

const RoleRoutes = require('./app/routes/role.router')
const UserRoutes = require('./app/routes/user.router')
const ProductRoutes = require('./app/routes/product.router');
const CategoryRoutes = require('./app/routes/category.router');
const SupportRoutes = require('./app/routes/support.router');
const AdminRoutes = require('./app/routes/product.router');

const { constants } = require('fs/promises');

const mongoDB = process.env.DB_LOCAL;
const url = process.env.DB_LIVE;
const PORT = serverConfig.PORT || 5000
const app = express();

const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true 
}
// Pour se connecter en local
/* mongoose.connect(mongoDB).then(r => {
     console.log('Connected to MongoDB local')
 });*/

//Pour se connecter au live
mongoose.connect(url, connectionParams).then(() => {
    console.log("Connected to MongoDB live")
})
.catch( (err) => {
    console.error(`Error connecting to the database. n${err}`);
});

const db = mongoose.connection;
// Bind connection to error event (to get notification of connection errors)

db.on("error", console.error.bind(console, "MongoDB connection error:"));

BddCreate.insertRoleBDD()

const corsOptions = {
    origin:'*',
    credentials: true,
    optionsSuccessStatus:200,
    methods: "*"
}

job.task()
job.startCron()

app.use(cors(corsOptions));

app.use(express.json())

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/role", RoleRoutes)
app.use("/users", UserRoutes);
app.use('/products', ProductRoutes);
app.use('/products', CategoryRoutes);
app.use('/admin', AdminRoutes)

app.use('/support', SupportRoutes)

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;


const paymentIntent = await stripe.paymentIntents.create({
  amount: calculateOrderAmount(items),
  currency: "usd",
  automatic_payment_methods: {
    enabled: true,
  },
});
res.send({
  clientSecret: paymentIntent.client_secret,
});

});
  
  



app.listen(PORT,  () => console.log(`Server is running on port ${PORT}`));


