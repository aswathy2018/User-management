const User = require('../models/userModel');
const auth = require('../auth/auth');
const bcrypt = require('bcrypt')
// for loading login page
const loadLogin = async (req, res) => {
    try {
        res.render('login', { title: "Admin Login", message: req.session.admin?.message })
    } catch (err) {
        console.log(err)
    }
}

// for authenticating admin

const verifyLogin = async (req, res) => {
    try {
        req.session.admin ??= {}
        const { email, password } = req.body
        const userData = await User.findOne({ email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            // checking for password match
            if (passwordMatch) {
                // checkig if this is an admin or not
                if (userData.is_admin) {
                    req.session.admin.message = null;
                    req.session.admin.email = userData.email;
                    req.session.admin.username = userData.username;
                    res.redirect('/admin');
                } else {
                    req.session.admin.message = "You dont have admin rights";
                    res.redirect('/admin/login');
                }
            } else {
                req.session.admin.message = "Password is wrong";
                res.redirect('/admin/login');
            }
        } else {
            req.session.admin.message = "User not found";
            res.redirect('/admin/login');
        }
    } catch (err) {
        console.log(err)
    }
}

const loadHome = async (req, res) => {
    try {
        const email = req.session.admin?.email;
        const adminData = await User.findOne({ email });
        let userDetails;
        const searchTerm = req.query.query;
        const regex = new RegExp(searchTerm);
        if (searchTerm) {
            userDetails = await User.find({$or:[{email:{$regex:regex}}, {username:{$regex:regex}}], is_admin:0})
        } else {
            userDetails = await User.find({ is_admin: 0 });
        }
        res.render('home', { title: "Admin DashBoard", userDetails })
    } catch (err) {
        console.log(err)
    }
}

const logout = async (req, res) => {
    try {
        req.session.admin = null;
        res.redirect('/admin/login')
    } catch (err) {
        console.log(err)
    }
}

const loadEditUser = async (req, res) => {
    try {
        const userData = await User.findOne({ _id: req.params.id });
        res.render('editUser', { userData, error: req.query.err ?? '' })
    } catch (err) {
        console.log(err)
    }
}

const editUser = async (req, res) => {
    try {
        const user = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        }
        const userData = await User.updateOne({ _id: req.params.id }, user);
        res.redirect('/admin')
    } catch (err) {
        if (err.errorResponse?.code == 11000) {
            res.redirect('/admin/editUser/' + req.params.id + "/?err=duplicate")
        } else {
            console.log(err)
        }
    }
}

const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await User.deleteOne({ _id: id });
        res.redirect('/admin');
    } catch (err) {
        console.log(err)
    }
}

const loadAddUser = async (req, res) => {
    try {
        res.render('addUser', { title: 'Add User', message: '' });
    } catch (err) {
        console.log(err)
    }
}


const securePassword = async (password) => {
    try {
        // console.log(password)
        const hashedPass = await bcrypt.hash(password, 10);
        return hashedPass;
    } catch (err) {
        console.log(err);
    }
}

const addUser = async (req, res) => {
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
            res.redirect('/admin');
        } else {
            res.render('addUser', { title: 'Add User', message: 'Cannot add user to database' })
        }
    } catch (error) {
        if (error.errorResponse?.code == 11000) {
            res.render('addUser', { title: 'Add User', message: 'Username or Email already Exists' });
        } else {
            console.log(error)
        }
    }
}
module.exports = {
    loadLogin,
    verifyLogin,
    loadHome,
    logout,
    loadEditUser,
    editUser,
    deleteUser,
    loadAddUser,
    addUser
}