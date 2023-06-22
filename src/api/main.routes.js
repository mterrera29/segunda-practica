import { Router } from "express";
import userModel from "./users/users.model.js";
import { createHash, isValidPassword } from "../utils.js"; 
import passport from "passport";
import initializePassport from '../auth/passport.config.js';
import { authentication, authorization } from '../auth/passport.config.js';

initializePassport();


const mainRoutes = (store) => {    
  const router = Router();

  router.get('/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => {
  });

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/githubfail' }), async (req, res) => {
    req.session.user = req.user;
    if(req.user.role === "admin") req.session.userAdmin = true
    req.session.errorMessage = '';
    req.session.lastName = req.user.lastName;
    req.session.firstName = req.user.firstName;
    req.session.userValidated = true
    res.redirect('/');
});

router.get('/', async (req, res) => {
    store.get(req.sessionID, async (err, data) => {
        if (err) console.log(`Error al recuperar datos de sesión (${err})`);
        if (data !== null && req.session.userValidated) {
            console.log("chau")
              res.redirect('http://localhost:3030/api/products')
        } else {
            console.log("hola")
            res.render('login', { sessionInfo: req.session});
        }

    });
});

router.get('/register', async (req, res) => {
    res.render('registration', {});
});

router.post('/login', async (req, res) => {
    req.session.userValidated = false;
    const { login_email, login_password } = req.body; 

    const user = await userModel.findOne({ userName: login_email });

    if (!user) {
        req.session.errorMessage = 'No se encuentra el usuario';
    } else if (!isValidPassword(user, login_password)) {
        req.session.errorMessage = 'Clave incorrecta';
    } else {
        req.session.userValidated = true;
        req.session.errorMessage = '';
        req.session.firstName = user.firstName;
        req.session.lastName = user.lastName;
        if(user.role === "admin") req.session.userAdmin = true
    } 
    res.redirect('http://localhost:3030')
    
});


router.get('/logout', async (req, res) => {
    req.session.userValidated = false;

    req.logout((err) => {
        if (err) { return next(err); }
        console.log("sesion destruida")
        res.redirect('/');
    });
});

router.get('/regfail', async (req, res) => {
    res.render('registration_err', {});
});

router.get('/githubfail', async (req, res) => {
    res.render('login_github_err', {});
});

router.post('/register', async (req, res) => {
    const { firstName, lastName, userName, password, age } = req.body; 
    if (!firstName || !lastName || !userName || !password ) res.status(400).send('Faltan campos obligatorios en el body');
    const newUser = { firstName: firstName, lastName: lastName, userName: userName, age: age, password: createHash(password)};
    const user = await userModel.findOne({ userName: userName });
    if(user){
        console.log("usuario repetido")
        res.redirect('http://localhost:3030/regfail')
    }else{
        const process = userModel.create(newUser);
        res.status(200).send({ message: 'Todo ok para cargar el usuario', data: newUser });
    }
    
});

  return router;
}

export default mainRoutes;