import { Router } from "express";
import userModel from "./users/users.model.js";
import { createHash, isValidPassword } from "../utils.js"; 
import passport from "passport";
import initializePassport from '../auth/passport.config.js';
import { authentication, authorization } from '../auth/passport.config.js';

initializePassport();


const mainRoutes = (store) => {    
  const router = Router();

  router.get('/github', passport.authenticate('github', { scope: ['user:email'] }),authorization('admin'), async (req, res) => {
  });
  router.get('/current2', authentication('github'),authorization('admin'), async (req, res) => {
    res.send({ status: 'OK', data: req.user });
  });

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/fail' }), async (req, res) => {
    req.session.user = req.user;
    req.session.userValidated = true
    res.redirect('/api/products');
});

router.get('/', async (req, res) => {
    store.get(req.sessionID, async (err, data) => {
        if (err) console.log(`Error al recuperar datos de sesión (${err})`);
        if (data !== null && req.session.userValidated) {
              res.redirect('http://localhost:3030/api/products')
        } else {
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
        if(login_email === "adminCoder@coder.com") req.session.userAdmin = true
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