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

async function insertarProductos() {
    const lote = 100;
    const total = 1000;

    for (let i = 0; i < total; i += lote) {
        const valores = [];

        for (let j = 0; j < lote; j++) {
            const nombre = `Producto_${i + j + 1}`;
            const precio = Math.floor(Math.random() * 100) + 1;
            const stock = Math.floor(Math.random() * 50) + 1;
            valores.push([nombre, precio, stock]);
        }

        try {
            await pool.query(
                'INSERT INTO Productos (nombre, precio, stock) VALUES ?',
                [valores]
            );
            console.log(`✅ Insertados productos ${i + 1} a ${i + lote}`);
        } catch (error) {
            console.error(`❌ Error al insertar productos ${i + 1} a ${i + lote}:`, error.message);
        }
    }

    await pool.end();
    console.log('🎉 Inserción completada.');
}

insertarProductos();
