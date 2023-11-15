const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');

const app = express();
const port = 3000;

// Definir array de usuarios (en memoria)
const users = [{ id: 1, username: 'usuario1', password: 'contrasena1' }];

// Configuración de Express
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Configuración de Express-session
app.use(session({ secret: 'tu_secreto_secreto', resave: true, saveUninitialized: true }));

// Configuración de Passport y sesiones
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // Configuración de connect-flash

// Configuración de Passport para autenticación local
passport.use(new LocalStrategy(
    (username, password, done) => {
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Usuario o contraseña incorrectos.' });
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    const user = users.find(u => u.id === id);
    done(null, user);
});

// Rutas
app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

app.post('/agregar-cita', isAuthenticated, (req, res) => {
    const nuevaCita = req.body.cita;
    console.log('Nueva cita:', nuevaCita);
    res.redirect('/');
});

// Rutas de autenticación
app.get('/login', (req, res) => {
    res.render('login', { message: req.flash('error') });
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Inicia el servidor
app.listen(port, () => {
    console.log(`El servidor está escuchando en http://localhost:${port}`);
});
