const checkLogin = (req, res, next)=>{
    if(req.session.user?.username){
        res.redirect('/');
    }else{
        next();
    }
}
const checkAdminLogin = (req, res, next)=>{
    if(req.session.admin?.username){
        res.redirect('/admin');
    }else{
        next();
    }
}

const checkLogout = (req, res, next)=>{
    if(req.session.user?.email){
        next();
    }else{
        res.redirect('/login');
    }

}
const checkAdminLogout = (req, res, next)=>{
    if(req.session.admin?.email){
        next();
    }else{
        res.redirect('/admin/login');
    }

}

module.exports = {
    checkLogin,
    checkLogout,
    checkAdminLogin,
    checkAdminLogout
}