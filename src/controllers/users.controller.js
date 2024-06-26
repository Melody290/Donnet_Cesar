const usersCtrl = {};

const passport = require('passport');

const User = require('../models/Usuario');

usersCtrl.renderSignUpForm = (req, res) => {
    res.render('usuarios/signup');
};

usersCtrl.signup =  async (req, res) => {
    const errors = [];
    const { name, last_names, age, elements, email, password, confirm_password, admin } = req.body;
    if (password != confirm_password) {
        errors.push({text: 'Las contraseñas no coinciden'});
    }
    if (password.length < 4){
        errors.push({text: 'La contraseña debe tener mas de 4 caracteres'})
    }
    if (errors.length > 0){
        res.render('usuarios/signup', {
            errors,
            name,
            last_names,
            age,
            email
        })
    } else {
        const emailUser = await User.findOne({email: email});
        if (emailUser) {
            req.flash('error_msg', 'El correo ya ha sido registrado');
            res.redirect('/usuarios/signup');
        } else {
            const newUser = new User({name, last_names, age, elements, email, password, admin});
            newUser.password =  await newUser.encryptPassword(password);
            await newUser.save();
            req.flash('success_msg', 'Haz sido registrado con éxito');
            res.redirect('/usuarios/signin');
        }
    }
};

usersCtrl.renderSigninForm = (req, res) => {
    res.render('usuarios/signin');
    
};

/*usersCtrl.signin = passport.authenticate('local', {
    failureRedirect: '/usuarios/signin',
    successRedirect: '/',
    failureFlash: true
});*/

usersCtrl.signin = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash('error_msg', 'Usuario o contraseña incorrectos');
        return res.redirect('/usuarios/signin');
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        req.flash('success_msg', '¡Bienvenido!');
        res.redirect('/');
      });
    })(req, res, next);
  };

usersCtrl.logout = (req, res) => {
    req.logout( (err) => {
        if (err) { return next(err); }
        req.flash('success_msg', 'Sesión cerrada');
        res.redirect('/');
    });
};

usersCtrl.chatbot = (req, res) => {
    res.render('usuarios/chatbot');
}



module.exports = usersCtrl;