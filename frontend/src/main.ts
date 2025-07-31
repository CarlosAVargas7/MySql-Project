// ========== INTERFACES TYPESCRIPT (DEFINICIÓN DE TIPOS) ==========
// Definimos la estructura de un producto que viene del servidor
interface Producto {
    id: number;
    nombre: string;
    precio: number;
    stock: number;
}

// Definimos la estructura de un pedido que viene del servidor
interface Pedido {
    id: number;
    producto_id: number;
    cantidad: number;
    fecha: string; // Las fechas llegan como strings desde la API
}

// Definimos la estructura de datos para crear un producto
interface DatosProducto {
    nombre: string;
    precio: number;
    stock: number;
}

// Definimos la estructura de datos para crear un pedido
interface DatosPedido {
    producto_id: number;
    cantidad: number;
}

// Definimos la estructura de respuesta de error del servidor
interface ErrorResponse {
    error: string;
}

// ========== FUNCIÓN PARA CARGAR PRODUCTOS ==========
// Esta función obtiene todos los productos del servidor y los muestra en una tabla
async function cargarProductos(): Promise<void> {
    try {
        // PASO 1: Hacer petición GET al endpoint de productos
        // fetch() devuelve una Promise<Response>
        const response: Response = await fetch('http://localhost:3000/productos');

        // PASO 2: Convertir la respuesta HTTP a JSON
        // Sabemos que el servidor devuelve un array de productos
        const productos: Producto[] = await response.json();

        // PASO 3: Obtener la tabla donde mostraremos los productos
        // Usamos type assertion para decirle a TypeScript que es una tabla
        const table = document.getElementById('productosTable') as HTMLTableElement;

        // PASO 4: Crear el encabezado de la tabla
        // innerHTML reemplaza todo el contenido HTML interno del elemento
        table.innerHTML = '<tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr>';

        // PASO 5: Iterar sobre cada producto y crear una fila en la tabla
        productos.forEach((p: Producto) => {
            // PASO 5a: Crear una nueva fila en la tabla
            // insertRow() es un método específico de las tablas HTML
            const row: HTMLTableRowElement = table.insertRow();

            // PASO 5b: Llenar la fila con los datos del producto
            // Template literals (``) nos permiten interpolar variables
            // onclick="eliminarProducto(${p.id})" crea un evento click en el botón
            row.innerHTML = `
          <td>${p.id}</td>
          <td>${p.nombre}</td>
          <td>${p.precio}</td>
          <td>${p.stock}</td>
          <td><button class="delete-btn" onclick="eliminarProducto(${p.id})">Eliminar</button></td>
        `;
        });

    } catch (error) {
        // PASO 6: Manejar errores si la petición falla
        console.error('Error al cargar productos:', error as Error);
    }
}

// ========== FUNCIÓN PARA CARGAR PRODUCTOS CON BAJO STOCK ==========
// Esta función obtiene productos con stock menor a 10 unidades
async function cargarBajoStock(): Promise<void> {
    try {
        // PASO 1: Hacer petición al endpoint específico de bajo stock
        const response: Response = await fetch('http://localhost:3000/productos/bajo-stock');

        // PASO 2: Convertir respuesta a JSON
        const productos: Producto[] = await response.json();

        // PASO 3: Obtener la tabla de bajo stock
        const table = document.getElementById('bajoStockTable') as HTMLTableElement;

        // PASO 4: Crear encabezado (sin columna de acciones)
        table.innerHTML = '<tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Stock</th></tr>';

        // PASO 5: Llenar tabla con productos de bajo stock
        productos.forEach((p: Producto) => {
            const row: HTMLTableRowElement = table.insertRow();
            // Note que aquí NO hay botón de eliminar
            row.innerHTML = `<td>${p.id}</td><td>${p.nombre}</td><td>${p.precio}</td><td>${p.stock}</td>`;
        });

    } catch (error) {
        console.error('Error al cargar bajo stock:', error as Error);
    }
}

// ========== FUNCIÓN PARA CARGAR PEDIDOS ==========
// Esta función obtiene todos los pedidos registrados
async function cargarPedidos(): Promise<void> {
    try {
        // PASO 1: Hacer petición al endpoint de pedidos
        const response: Response = await fetch('http://localhost:3000/pedidos');

        // PASO 2: Convertir respuesta a JSON
        const pedidos: Pedido[] = await response.json();

        // PASO 3: Obtener la tabla de pedidos
        const table = document.getElementById('pedidosTable') as HTMLTableElement;

        // PASO 4: Crear encabezado de la tabla de pedidos
        table.innerHTML = '<tr><th>ID</th><th>Producto ID</th><th>Cantidad</th><th>Fecha</th></tr>';

        // PASO 5: Llenar tabla con pedidos
        pedidos.forEach((p: Pedido) => {
            const row: HTMLTableRowElement = table.insertRow();
            row.innerHTML = `<td>${p.id}</td><td>${p.producto_id}</td><td>${p.cantidad}</td><td>${p.fecha}</td>`;
        });

    } catch (error) {
        console.error('Error al cargar pedidos:', error as Error);
    }
}

// ========== EVENT LISTENER PARA AGREGAR PRODUCTO ==========
// Se ejecuta cuando el usuario envía el formulario de crear producto
const productoForm = document.getElementById('productoForm') as HTMLFormElement;

productoForm.addEventListener('submit', async (e: Event): Promise<void> => {
    // PASO 1: Prevenir el comportamiento predeterminado del formulario
    // Sin esto, la página se recargaría
    e.preventDefault();

    // PASO 2: Obtener los valores de los campos del formulario
    const nombreInput = document.getElementById('nombre') as HTMLInputElement;
    const precioInput = document.getElementById('precio') as HTMLInputElement;
    const stockInput = document.getElementById('stock') as HTMLInputElement;

    // Extraer valores y convertir números
    const nombre: string = nombreInput.value;
    const precio: number = parseFloat(precioInput.value); // Convertir string a número
    const stock: number = parseInt(stockInput.value);     // Convertir string a entero

    try {
        // PASO 3: Crear objeto con los datos del producto
        const datosProducto: DatosProducto = { nombre, precio, stock };

        // PASO 4: Enviar petición POST para crear el producto
        const response: Response = await fetch('http://localhost:3000/productos', {
            method: 'POST',                                    // Tipo de petición
            headers: { 'Content-Type': 'application/json' },  // Indicamos que enviamos JSON
            body: JSON.stringify(datosProducto)               // Convertimos objeto a string JSON
        });

        // PASO 5: Verificar si la respuesta fue exitosa
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        // PASO 6: Limpiar el formulario después del éxito
        productoForm.reset();

        // PASO 7: Actualizar las tablas para mostrar los cambios
        await cargarProductos();    // Actualizar tabla principal
        await cargarBajoStock();    // Actualizar tabla de bajo stock

    } catch (error) {
        console.error('Error al agregar producto:', error as Error);
    }
});

// ========== EVENT LISTENER PARA ACTUALIZAR PRODUCTO ==========
// Se ejecuta cuando el usuario envía el formulario de actualizar producto
const actualizarProductoForm = document.getElementById('actualizarProductoForm') as HTMLFormElement;

actualizarProductoForm.addEventListener('submit', async (e: Event): Promise<void> => {
    e.preventDefault();

    // PASO 1: Obtener valores del formulario de actualización
    const idInput = document.getElementById('idActualizar') as HTMLInputElement;
    const nombreInput = document.getElementById('nombreActualizar') as HTMLInputElement;
    const precioInput = document.getElementById('precioActualizar') as HTMLInputElement;
    const stockInput = document.getElementById('stockActualizar') as HTMLInputElement;

    const id: number = parseInt(idInput.value);
    const nombre: string = nombreInput.value;
    const precio: number = parseFloat(precioInput.value);
    const stock: number = parseInt(stockInput.value);

    try {
        // PASO 2: Crear objeto con los nuevos datos
        const datosProducto: DatosProducto = { nombre, precio, stock };

        // PASO 3: Enviar petición PUT para actualizar el producto
        // PUT se usa para actualizar recursos existentes
        const response: Response = await fetch(`http://localhost:3000/productos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosProducto)
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        // PASO 4: Limpiar formulario y actualizar tablas
        actualizarProductoForm.reset();
        await cargarProductos();
        await cargarBajoStock();

    } catch (error) {
        console.error('Error al actualizar producto:', error as Error);
    }
});

// ========== FUNCIÓN PARA ELIMINAR PRODUCTO ==========
// Esta función se llama desde el botón "Eliminar" en cada fila de la tabla
async function eliminarProducto(id: number): Promise<void> {
    try {
        // PASO 1: Enviar petición DELETE al servidor
        // DELETE se usa para eliminar recursos
        const response: Response = await fetch(`http://localhost:3000/productos/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        // PASO 2: Actualizar tablas después de eliminar
        await cargarProductos();
        await cargarBajoStock();

    } catch (error) {
        console.error('Error al eliminar producto:', error as Error);
    }
}

// ========== EVENT LISTENER PARA REGISTRAR PEDIDO ==========
// Se ejecuta cuando el usuario envía el formulario de crear pedido
const pedidoForm = document.getElementById('pedidoForm') as HTMLFormElement;

pedidoForm.addEventListener('submit', async (e: Event): Promise<void> => {
    e.preventDefault();

    // PASO 1: Obtener datos del formulario de pedido
    const productoIdInput = document.getElementById('producto_id') as HTMLInputElement;
    const cantidadInput = document.getElementById('cantidad') as HTMLInputElement;

    const producto_id: number = parseInt(productoIdInput.value);
    const cantidad: number = parseInt(cantidadInput.value);

    try {
        // PASO 2: Crear objeto con datos del pedido
        const datosPedido: DatosPedido = { producto_id, cantidad };

        // PASO 3: Enviar petición POST para crear el pedido
        const response: Response = await fetch('http://localhost:3000/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPedido)
        });

        // PASO 4: Verificar si hubo error (ej. stock insuficiente)
        if (!response.ok) {
            // Si hay error, obtener el mensaje de error del servidor
            const errorData: ErrorResponse = await response.json();
            alert(errorData.error); // Mostrar error al usuario (ej. "Stock insuficiente")
        } else {
            // PASO 5: Si todo salió bien, limpiar formulario y actualizar tablas
            pedidoForm.reset();
            await cargarProductos();    // El stock habrá cambiado
            await cargarBajoStock();    // Puede haber nuevos productos con bajo stock
            await cargarPedidos();      // Mostrar el nuevo pedido
        }

    } catch (error) {
        console.error('Error al registrar pedido:', error as Error);
    }
});

// ========== INICIALIZACIÓN ==========
// Cargar todos los datos cuando la página se carga por primera vez
// Estas funciones se ejecutan inmediatamente al cargar el script
cargarProductos();
cargarBajoStock();
cargarPedidos();

// ========== EXPLICACIÓN DEL FLUJO COMPLETO ==========
/*
FLUJO DE LA APLICACIÓN:
 
1. CARGA INICIAL:
   - Se ejecutan cargarProductos(), cargarBajoStock(), cargarPedidos()
   - Se llenan las tres tablas con datos del servidor
   - El usuario ve el estado actual del inventario
 
2. CREAR PRODUCTO:
   - Usuario llena formulario con nombre, precio, stock
   - Se envía POST a /productos  
   - Se actualiza la tabla de productos
   - Se actualiza la tabla de bajo stock (por si aplica)
 
3. ACTUALIZAR PRODUCTO:
   - Usuario llena formulario con ID y nuevos datos
   - Se envía PUT a /productos/:id
   - Se actualizan ambas tablas
 
4. ELIMINAR PRODUCTO:
   - Usuario hace clic en botón "Eliminar"
   - Se ejecuta eliminarProducto(id)
   - Se envía DELETE a /productos/:id
   - Se actualizan las tablas
 
5. CREAR PEDIDO:
   - Usuario especifica producto_id y cantidad
   - Se envía POST a /pedidos
   - El servidor verifica stock y crea transacción
   - Si hay error (stock insuficiente), se muestra alert
   - Si es exitoso, se actualizan todas las tablas
 
MÉTODOS HTTP USADOS:
- GET: Para obtener datos (productos, pedidos)
- POST: Para crear nuevos recursos (productos, pedidos)
- PUT: Para actualizar recursos existentes (productos)
- DELETE: Para eliminar recursos (productos)
 
MANEJO DE ERRORES:
- try/catch en todas las operaciones asíncronas
- Verificación de response.ok
- Mostrar errores específicos del servidor (como stock insuficiente)
- Logging de errores para debugging
*/

// Hacer que la función eliminarProducto esté disponible globalmente
// Esto es necesario porque la llamamos desde onclick en el HTML
(window as any).eliminarProducto = eliminarProducto;