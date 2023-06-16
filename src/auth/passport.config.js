import passport from "passport";
import GithubStrategy from 'passport-github2';
import userModel from '../api/users/users.model.js';
import {} from 'dotenv/config'

const initializePassport = () => {

  const githubData = {
    clientID: 'Iv1.efceb83d5df8cfe4',
    clientSecret: process.env.SECRET_KEY,
    callbackUrl: 'http://localhost:3030/githubcallback'
  };
    const verifyAuthGithub = async (accessToken, refreshToken, profile, done) => {
      // Así como la estrategia local de passport opera con usuario y clave, la de
      // Github trabaja con un profile (perfil) devuelto por Github luego del proceso
      // de autenticación, con la cual podemos cotejar contra nuestros propios datos
      // y tomar también los que necesitmos para actualizar nuestra bbdd o mostrar.
      //console.log(profile._json)
      try {
          // console.log(profile);
          const user = await userModel.findOne({ userName: profile._json.email });
  
          if (!user) {
              // const [first, last] = fullName.split(' ');
              // El callback done es el mecanismo utilizado por passport para retornar
              // la respuesta de la autenticación
              done(null, false);
          } else {
              done(null, user);
          }
      } catch (err) {
          return done(err.message);
      }
  }
  
  // Generamos una nueva estrategia GithubStrategy, con el nombre github
  // utilizando los datos y el callback configurados arriba
  passport.use('github', new GithubStrategy(githubData, verifyAuthGithub));



  
  // Recordar que passport necesita esta configuración de serializeUser
  // y deserializeUser para gestionar correctamente el pasaje de datos a session
  passport.serializeUser((user, done) => {
      done(null, user._id);
  });
  
  passport.deserializeUser(async (id, done) => {
      try {
          const user = await userModel.findById(id);
          done(null, user);
      } catch (err) {
          done(err.message);
      }
  });
}

  // Middleware de autenticación detallada
// En lugar de llamar directamente a passport.authenticate en el endpoint, llamamos a este
const authentication = (strategy) => {
    return async (req, res, next) => {
        passport.authenticate(strategy, (err, user, info) => {
            if (err) return next(err);
            if (!user) {
                return res.status(401).send({ error: info.messages ? info.messages : info.toString() });
            }
            req.user = user;
            next();
        })(req, res, next);
    }
}

// Middleware de autorización
const authorization = (role) => {
    return async(req, res, next) => {
        if (!req.user) return res.status(401).send({ error: 'Unauthorized' });
        if (req.user.role != 'admin' && req.user.role != role) return res.status(403).send({ error: 'No permissions' });
        next();
    }
}

export default initializePassport ;
export {authentication, authorization }
