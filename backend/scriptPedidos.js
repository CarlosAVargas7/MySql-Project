const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'administrador',
    password: 'aloha',
    database: 'inventario',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function insertarPedidos() {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        for (let i = 1; i <= 10000; i++) {
            const producto_id = (i % 1000) + 1;
            const cantidad = Math.floor(Math.random() * 5) + 1;

            // Verificar que el producto exista
            const [productoRows] = await connection.query(
                'SELECT stock FROM Productos WHERE id = ?',
                [producto_id]
            );

            if (productoRows.length === 0) {
                console.warn(`⚠️ Producto ${producto_id} no existe. Pedido ${i} omitido.`);
                continue;
            }

            const stockActual = productoRows[0].stock;
            if (stockActual < cantidad) {
                console.warn(`⚠️ Stock insuficiente para producto ${producto_id}. Pedido ${i} omitido.`);
                continue;
            }

            // Insertar el pedido
            await connection.query(
                'INSERT INTO Pedidos (producto_id, cantidad, fecha) VALUES (?, ?, NOW())',
                [producto_id, cantidad]
            );

            // Actualizar el stock
            await connection.query(
                'UPDATE Productos SET stock = stock - ? WHERE id = ?',
                [cantidad, producto_id]
            );

            if (i % 1000 === 0) {
                console.log(`✅ Insertados ${i} pedidos...`);
            }
        }

        await connection.commit();
        console.log('🎉 10,000 pedidos procesados exitosamente');
    } catch (error) {
        await connection.rollback();
        console.error('❌ Error durante la inserción:', error.message);
    } finally {
        connection.release();
    }
}

insertarPedidos();
