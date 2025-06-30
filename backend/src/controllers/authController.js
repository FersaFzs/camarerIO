import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'

// Generar token JWT
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'tu_secreto_temporal',
    { expiresIn: '24h' }
  )
}

// Login
export const login = async (req, res) => {
  try {
    const { username, email, password } = req.body
    console.log('Intento de login con:', { username, email })

    if (!username && !email) {
      return res.status(400).json({ message: 'Se requiere username o email' })
    }

    if (!password) {
      return res.status(400).json({ message: 'Se requiere contraseña' })
    }

    // Buscar usuario por username o email
    const user = await User.findOne({
      $or: [
        { username: username || email },
        { email: email }
      ]
    })

    console.log('Usuario encontrado:', user ? 'Sí' : 'No')
    if (user) {
      console.log('Rol del usuario encontrado:', user.role)
    }

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    // Verificar contraseña directamente con bcrypt
    console.log('Comparando contraseñas:')
    console.log('Contraseña candidata:', password)
    console.log('Hash almacenado:', user.password)
    
    // Verificar que el hash es válido
    const isValidHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$')
    console.log('¿Es un hash válido?:', isValidHash)
    
    const isMatch = await bcrypt.compare(password, user.password)
    console.log('¿Coinciden?:', isMatch)

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    // Generar token
    const token = generateToken(user._id, user.role)

    // Enviar respuesta sin la contraseña
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role
    }

    console.log('Login exitoso para:', userResponse)
    console.log('Rol enviado en la respuesta:', userResponse.role)

    res.json({
      token,
      user: userResponse
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

// Crear usuarios de prueba
export const createTestUser = async () => {
  try {
    // Eliminar usuarios existentes para empezar limpio
    await User.deleteOne({ username: 'admin' })
    await User.deleteOne({ username: 'camarero' })
    console.log('Usuarios existentes eliminados')

    // Crear usuario admin
    const admin = await User.create({
      username: 'admin',
      password: 'admin123',
      name: 'Administrador',
      role: 'admin',
      email: 'admin@waiterapp.com'
    })
    console.log('Usuario administrador creado:', {
      ...admin.toObject(),
      password: admin.password,
      role: admin.role
    })

    // Verificar contraseña admin
    const adminMatch = await bcrypt.compare('admin123', admin.password)
    console.log('Verificación contraseña admin:', adminMatch)

    // Crear usuario camarero
    const waiter = await User.create({
      username: 'camarero',
      password: 'camarero123',
      name: 'Camarero',
      role: 'user',
      email: 'camarero@waiterapp.com'
    })
    console.log('Usuario camarero creado:', {
      ...waiter.toObject(),
      password: waiter.password,
      role: waiter.role
    })

    // Verificar contraseña camarero
    const waiterMatch = await bcrypt.compare('camarero123', waiter.password)
    console.log('Verificación contraseña camarero:', waiterMatch)

    // Verificar usuarios en la base de datos
    const adminInDb = await User.findOne({ username: 'admin' })
    const waiterInDb = await User.findOne({ username: 'camarero' })
    
    console.log('Verificación final:')
    console.log('Admin en DB:', {
      ...adminInDb.toObject(),
      password: adminInDb.password,
      role: adminInDb.role
    })
    console.log('Camarero en DB:', {
      ...waiterInDb.toObject(),
      password: waiterInDb.password,
      role: waiterInDb.role
    })

  } catch (error) {
    console.error('Error al crear usuarios de prueba:', error)
  }
}

// Crear usuario (solo admin)
export const register = async (req, res) => {
  try {
    const { username, email, password, role, name } = req.body;
    if (!username || !password || !name) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    // Comprobar si ya existe el usuario
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'El usuario ya existe' });
    }
    // Crear usuario
    const user = new User({ username, email, password, role, name });
    await user.save();
    res.status(201).json({ message: 'Usuario creado correctamente', user: { username, email, role, name, _id: user._id } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener todos los usuarios (solo admin)
export const getUsers = async (req, res) => {
  try {
    // Opcional: comprobar si el usuario es admin (si tienes auth middleware)
    // if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'No autorizado' });
    const users = await User.find({}, '-password').sort({ username: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 