// ========== IMPORTACIONES ==========
// Importamos Express (framework web para Node.js) y sus tipos TypeScript
import express, { Request, Response } from 'express';
// Importamos mysql2/promise para conectarnos a MySQL usando promesas (async/await)
import mysql from 'mysql2/promise';
// Importamos cors para permitir peticiones desde otros dominios
import cors from 'cors';

// ========== CONFIGURACIÓN DE EXPRESS ==========
// Creamos una instancia de la aplicación Express
const app = express();

// ========== CONFIGURACIÓN DE CORS ==========
// CORS permite que el frontend (puerto 5173) se comunique con el backend (puerto 3000)
app.use(cors({
  origin: 'http://localhost:5173',  // Permitir peticiones desde Vite
  credentials: true                 // Permitir cookies y headers de autenticación
}));

// Middleware para parsear JSON automáticamente
// Esto permite que Express entienda el JSON que llega en las peticiones HTTP
app.use(express.json());

// Middleware para servir archivos estáticos desde la carpeta 'public'
// Por ejemplo: imágenes, CSS, HTML, etc.
app.use(express.static('public'));

// ========== CONFIGURACIÓN DE LA BASE DE DATOS ==========
// Creamos un pool de conexiones a MySQL
// Un pool es un conjunto de conexiones reutilizables para mejorar el rendimiento
const pool = mysql.createPool({
  host: 'localhost',
  user: 'administrador',
  password: 'aloha',
  database: 'inventario',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ========== ENDPOINTS DE LA API ==========

// ========== CREAR PRODUCTO ==========
// POST /productos - Crear un nuevo producto
app.post('/productos', async (req: Request, res: Response) => {
  // Extraemos los datos del cuerpo de la petición usando destructuring
  const { nombre, precio, stock } = req.body;

  try {
    // Ejecutamos una consulta SQL INSERT para agregar el producto
    // Los ? son placeholders que se reemplazan por los valores del array
    // Esto previene inyecciones SQL
    const [result] = await pool.query(
      'INSERT INTO Productos (nombre, precio, stock) VALUES (?, ?, ?)',
      [nombre, precio, stock]
    );

    // Enviamos respuesta JSON con el ID del producto creado
    res.json({
      id: (result as any).insertId, // ID autoincremental del producto
      mensaje: 'Producto creado'
    });
  } catch (error) {
    // Si hay un error, enviamos código 400 (Bad Request) con el mensaje de error
    res.status(400).json({ error: (error as Error).message });
  }
});

// ========== LISTAR TODOS LOS PRODUCTOS ==========
// GET /productos - Obtener todos los productos
app.get('/productos', async (req: Request, res: Response) => {
  try {
    // Ejecutamos SELECT para obtener todos los productos
    const [rows] = await pool.query('SELECT * FROM Productos');

    // Enviamos los productos como JSON
    res.json(rows);
  } catch (error) {
    // Si hay error, enviamos código 400 con el mensaje
    res.status(400).json({ error: (error as Error).message });
  }
});

// ========== LISTAR PRODUCTOS CON BAJO STOCK ==========
// GET /productos/bajo-stock - Obtener productos con stock menor a 10
app.get('/productos/bajo-stock', async (req: Request, res: Response) => {
  try {
    // Consulta SQL que filtra productos con stock < 10
    const [rows] = await pool.query('SELECT * FROM Productos WHERE stock < 10');

    // Enviamos los productos filtrados
    res.json(rows);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// ========== ACTUALIZAR PRODUCTO ==========
// PUT /productos/:id - Actualizar un producto existente
app.put('/productos/:id', async (req: Request, res: Response) => {
  // Extraemos el ID del producto desde los parámetros de la URL
  const { id } = req.params;

  // Extraemos los nuevos datos del cuerpo de la petición
  const { nombre, precio, stock } = req.body;

  try {
    // Ejecutamos UPDATE para modificar el producto
    const [result] = await pool.query(
      'UPDATE Productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?',
      [nombre, precio, stock, id]
    );

    // Verificamos si se actualizó alguna fila
    if ((result as any).affectedRows === 0) {
      // Si no se actualizó nada, el producto no existe
      res.status(404).json({ error: 'Producto no encontrado' });
    } else {
      // Si se actualizó, enviamos confirmación
      res.json({ mensaje: 'Producto actualizado' });
    }
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// ========== ELIMINAR PRODUCTO ==========
// DELETE /productos/:id - Eliminar un producto
app.delete('/productos/:id', async (req: Request, res: Response) => {
  // Extraemos el ID del producto desde los parámetros de la URL
  const { id } = req.params;

  try {
    // Ejecutamos DELETE para eliminar el producto
    const [result] = await pool.query('DELETE FROM Productos WHERE id = ?', [id]);

    // Verificamos si se eliminó alguna fila
    if ((result as any).affectedRows === 0) {
      // Si no se eliminó nada, el producto no existe
      res.status(404).json({ error: 'Producto no encontrado' });
    } else {
      // Si se eliminó, enviamos confirmación
      res.json({ mensaje: 'Producto eliminado' });
    }
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// ========== REGISTRAR PEDIDO (CON TRANSACCIÓN) ==========
// POST /pedidos - Crear un pedido y reducir el stock
app.post('/pedidos', async (req: Request, res: Response) => {
  // Extraemos los datos del pedido
  const { producto_id, cantidad } = req.body;

  // Obtenemos una conexión específica del pool para la transacción
  const connection = await pool.getConnection();

  try {
    // Iniciamos una transacción
    // Una transacción agrupa varias operaciones que deben ejecutarse juntas
    await connection.beginTransaction();

    // 1. Insertamos el pedido en la tabla Pedidos
    // NOW() es una función de MySQL que obtiene la fecha/hora actual
    await connection.query(
      'INSERT INTO Pedidos (producto_id, cantidad, fecha) VALUES (?, ?, NOW())',
      [producto_id, cantidad]
    );

    // 2. Actualizamos el stock del producto, pero solo si hay suficiente stock
    // La condición "stock >= ?" asegura que no vendamos más de lo que tenemos
    const [result] = await connection.query(
      'UPDATE Productos SET stock = stock - ? WHERE id = ? AND stock >= ?',
      [cantidad, producto_id, cantidad]
    );

    // Verificamos si se actualizó alguna fila
    if ((result as any).affectedRows === 0) {
      // Si no se actualizó, significa que no hay suficiente stock
      throw new Error('Stock insuficiente');
    }

    // Si todo salió bien, confirmamos la transacción
    await connection.commit();
    res.json({ mensaje: 'Pedido registrado' });

  } catch (error) {
    // Si hay algún error, deshacemos todos los cambios
    await connection.rollback();
    res.status(400).json({ error: (error as Error).message });
  } finally {
    // Liberamos la conexión para que otros la puedan usar
    // El bloque finally SIEMPRE se ejecuta, haya error o no
    connection.release();
  }
});

// ========== LISTAR PEDIDOS ==========
// GET /pedidos - Obtener todos los pedidos
app.get('/pedidos', async (req: Request, res: Response) => {
  try {
    // Consultamos todos los pedidos
    const [rows] = await pool.query('SELECT * FROM Pedidos');
    res.json(rows);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// ========== INICIAR EL SERVIDOR ==========
// Ponemos el servidor a escuchar en el puerto 3000
app.listen(3000, () => {
  console.log('🚀 Servidor backend corriendo en http://localhost:3000');
  console.log('📡 CORS configurado para frontend en http://localhost:5173');
});