const express = require('express');
const admin_route = express();
const session = require('express-session');
const auth = require('../auth/auth')

admin_route.set('view engine', 'ejs');
admin_route.set('views','./views/admin')

// controllers
const adminController = require('../controllers/adminController')

admin_route.use(express.urlencoded({extended:true}))

admin_route.use(session({
    name:"admin session",
    secret: 'admin', // Replace with a strong secret key
    resave: false, // Don't save the session if unmodified
    saveUninitialized: false, // Don't create a session until something is stored
    cookie: { secure: false }
  }));

  // admin home page
  admin_route.get('/',auth.checkAdminLogout, adminController.loadHome)

  // admin login page
  admin_route.get('/login', auth.checkAdminLogin, adminController.loadLogin)
  admin_route.post('/login', adminController.verifyLogin)

  admin_route.get('/logout', adminController.logout);

  // user editing routes

  admin_route.get('/editUser/:id', auth.checkAdminLogout, adminController.loadEditUser);
  admin_route.post('/editUser/:id', auth.checkAdminLogout, adminController.editUser);

  // delete user
  admin_route.get('/delete/:id', auth.checkAdminLogout,adminController.deleteUser)

  // update user route
  admin_route.get('/add-user', auth.checkAdminLogout, adminController.loadAddUser)
  admin_route.post('/add-user', auth.checkAdminLogout, adminController.addUser)

  module.exports = admin_route;