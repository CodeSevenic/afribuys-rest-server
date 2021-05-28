const express = require('express');
const env = require('dotenv').config();
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

// routes
const userRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/admin/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const initialDataRoutes = require('./routes/admin/initialDataRoute');
const pageRoutes = require('./routes/admin/pageRoutes');
const addressRoutes = require('./routes/addressRoutes');
const orderRoutes = require('./routes/orderRouters');
const orderAdminRoutes = require('./routes/admin/orderAdminRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'uploads')));

// mongodb connection
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

try {
  mongoose
    .connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(() => {
      console.log('Database connected');
    });
} catch (error) {
  console.log(error);
}

app.use(cors());
app.use('/api', userRoutes);
app.use('/api', adminRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', cartRoutes);
app.use('/api', initialDataRoutes);
app.use('/api', pageRoutes);
app.use('/api', addressRoutes);
app.use('/api', orderRoutes);
app.use('/api', orderAdminRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
