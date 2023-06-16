import express from 'express';
import { __dirname } from './utils.js';
import { engine } from 'express-handlebars';

import routes from './api/products/products.routes.js';
import routesCart from "./api/carts/carts.routes.js"
import mainRoutes from './api/main.routes.js';

import { Server } from 'socket.io';
import {} from 'dotenv/config'
import http from 'http';
import mongoose from 'mongoose';
import passport from 'passport';

import session from 'express-session';
import MongoStore from 'connect-mongo';


const PORT = parseInt(process.env.PORT) || 3000;
const MONGOOSE_URL = process.env.MONGOOSE_URL;

const app = express();
const server = http.createServer(app)

// store login

const store = MongoStore.create({ mongoUrl: MONGOOSE_URL, mongoOptions: {}, ttl: 30 });
app.use(session({
    store: store,
    secret: 'abcdefgh12345678',
    resave: false,
    saveUninitialized: true,
    /* cookie: { secure: true } */
    // cookie: { maxAge: 30 * 1000 }, // la sesión expira luego de 30 segundos de INACTIVIDAD
}));

// Creamos nueva instancia para el servidor socket.io, activando módulo cors con acceso desde cualquier lugar (*)
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
        credentials: false
    }
});
io.on('connection', (socket) => { // Escuchamos el evento connection por nuevas conexiones de clientes
  console.log(`Cliente conectado (${socket.id})`);
  
  // Emitimos el evento server_confirm
  socket.emit('server_confirm', 'Conexión recibida');
  
  socket.on('new_message', (data) => {;
      io.emit('msg_received', data); // io.emit realiza un broadcast (redistribución) a TODOS los clientes, incluyendo el que lo generó
  });
  
  socket.on("disconnect", (reason) => {
      console.log(`Cliente desconectado (${socket.id}): ${reason}`);
  });
});

// Auth
// Aquí en la app, solo importamos e inicializamos passport
app.use(passport.initialize());
// Parseo correcto de urls
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Motor de plantillas
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/views`);

app.use('/api', routes);
app.use('/api', routesCart);
app.use('/', mainRoutes(store))
app.use('/public', express.static(`${__dirname}/public`));

try {
  await mongoose.connect(MONGOOSE_URL);
  server.listen(PORT, () => {
      console.log(`Servidor iniciado en puerto ${PORT}`);
  });
} catch(err) {
  console.log('No se puede conectar con el servidor de bbdd');
}