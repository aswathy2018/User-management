const User = require("../models/userModel");
const bcrypt = require("bcrypt")

const securePassword = async (password) => {
    try {
        // console.log(password)
        const hashedPass = await bcrypt.hash(password, 10);
        return hashedPass;
    } catch (err) {
        console.log(err);
    }
}

const loadRegister = async (req, res) => {
    try {
        res.render('signup', { message: req.session.user?.signupMessage , title:"Sign Up"});
    } catch (error) {
        console.log(error.message);
    }
}

const loadLogin = async (req, res) => {
    try {
        res.render('login', { message: req.session.user?.message, title: 'Home Page' })
    } catch (err) {
        console.log(err)
    }
}

const insertUser = async (req, res) => {
    try {
        const hashedPass = await securePassword(req.body.password)
        const user = new User({
            username: req.body.name,
            email: req.body.email,
            password: hashedPass,
            is_admin: 0
        })
        const userData = await user.save();
        if (userData) {
            req.session.user ??= {}
            req.session.user.signupMessage = '';
            req.session.user.username = userData.username;
            req.session.user.email = userData.email;
            res.redirect('/');
        } else {
            req.session.user ??= {}
            req.session.user.signupMessage = "unable to register user";
            res.redirect('/signup')
        }
    } catch (error) {
        if (error.errorResponse?.code == 11000) {
            req.session.user ??= {}
            req.session.user.signupMessage = "This email or username is already registered";
            res.redirect('/signup');
        } else {
            console.log(error)
        }
    }
}

const verifyUser = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        
        // checking if user exixts or not
        
        if (userData) {
            if (await bcrypt.compare(password, userData.password)) {
                req.session.user ??= {}
                req.session.user.message = '';
                req.session.user.username = userData.username;
                req.session.user.email = userData.email;
                res.redirect('/');
            } else {
                req.session.user ??= {}
                req.session.user.message = "password is not matching";
                res.redirect('/login');
            }
        } else {
            req.session.user ??= {}
            req.session.user.message = "User not found";
            res.redirect('/login');
        }
    } catch (err) {
        console.log(err);
    }
}

const loadHome = async (req, res) => {
    try {
        const userData = await User.findOne({ username: req.session.user?.username });
        if (userData) {
            res.render('home', { title: 'Home', userData})
        }else{
            res.redirect('/logout')
        }
    } catch (err) {
        console.log(err)
    }
}

const logout = async (req, res) => {
    try {
        req.session.user = null;
        res.redirect('/login')
    } catch (err) {
        console.log(err)
    }
}

const loadUpdateUser = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.session.user.email });
        res.render('updateUser', { data: userData })
    } catch (err) {
        console.log(err)
    }
}

const updateUser = async (req, res) => {
    try {
        const data = {
            username: req.body.username,
            email: req.body.email,
        }
        let newData = await User.updateOne({ email: req.session.user.email }, data);
        res.redirect('/logout');
    } catch (error) {
        if (error.errorResponse?.code == 11000) {
            res.redirect('/');
        } else {
            console.log(error)
        }
    }
}
module.exports = {
    loadRegister,
    insertUser,
    loadLogin,
    verifyUser,
    loadHome,
    logout,
    loadUpdateUser,
    updateUser
}