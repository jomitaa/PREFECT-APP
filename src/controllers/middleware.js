export function authorize(roles) {
    return (req, res, next) => {
        console.log('Middleware llamado');
        console.log('Sesión:', req.session); // SERVIDOR
        if (req.session && req.session.loggedin) {
            console.log('Cargo en sesión:', req.session.cargo); // SERVIDOR
            if (roles.includes(req.session.cargo)) {
                return next();
            } else {
                return res.status(403).send('No tienes los permisos necesarios.');
            }
        }
        res.status(401).send('No estás autenticado.');
    };
}
