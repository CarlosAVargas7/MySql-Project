# Sistema de Gestión de Inventario - Backend con Node.js y Frontend con TypeScript

![Tecnologías utilizadas](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)

Un sistema completo de gestión de inventario con backend en Node.js/Express y frontend en TypeScript, que incluye funcionalidades CRUD para productos, gestión de pedidos con transacciones SQL, y visualización de productos con bajo stock.

## ✨ Características principales

- **Backend robusto**: API REST con Express.js y TypeScript
- **Frontend moderno**: Interfaz responsive con TypeScript puro (sin frameworks)
- **Base de datos**: MySQL con pool de conexiones y transacciones
- **Funcionalidades completas**:
  - CRUD de productos
  - Registro de pedidos con transacciones ACID
  - Alertas de bajo stock
  - Búsqueda y filtrado en tiempo real
- **Arquitectura limpia**: Separación clara entre frontend y backend

## 🛠️ Stack tecnológico

- **Backend**:
  - Node.js + Express
  - TypeScript
  - MySQL (mysql2/promise)
  - CORS para comunicación frontend-backend

- **Frontend**:
  - TypeScript puro (sin frameworks)
  - CSS moderno con diseño responsive
  - Fetch API para comunicación con el backend

- **Herramientas**:
  - Vite para el frontend
  - Docker (compose y Dockerfile)
  - Git para control de versiones

## 🚀 Retos técnicos y aprendizajes

### 1. Implementación de transacciones SQL para pedidos

**Reto**: Garantizar la consistencia de datos al registrar pedidos y actualizar el stock simultáneamente.

**Solución**: Implementé transacciones ACID en MySQL:
```typescript
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  
  // 1. Insertar pedido
  await connection.query('INSERT INTO Pedidos...');
  
  // 2. Actualizar stock (con verificación)
  const [result] = await connection.query(
    'UPDATE Productos SET stock = stock - ? WHERE id = ? AND stock >= ?',
    [cantidad, producto_id, cantidad]
  );
  
  if (result.affectedRows === 0) {
    throw new Error('Stock insuficiente');
  }
  
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
```

**Aprendizaje**: Entendí profundamente cómo las transacciones garantizan la integridad de los datos en operaciones críticas.

### 2. Comunicación frontend-backend con TypeScript

**Reto**: Mantener tipado seguro entre el frontend TypeScript y la API REST.

**Solución**: Creé interfaces compartidas y validación estricta:
```typescript
interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
}

// En las llamadas API
async function cargarProductos(): Promise<Producto[]> {
  const response = await fetch('/productos');
  return await response.json() as Producto[];
}
```

**Aprendizaje**: TypeScript mejora significativamente la mantenibilidad al reducir errores en tiempo de compilación.

### 3. Performance con grandes volúmenes de datos

**Reto**: Insertar 10,000 pedidos de prueba sin bloquear la aplicación.

**Solución**: Implementé procesamiento por lotes con feedback visual:
```javascript
for (let i = 1; i <= 10000; i++) {
  // Procesar pedido...
  
  if (i % 1000 === 0) {
    console.log(`✅ Insertados ${i} pedidos...`);
  }
}
```

**Aprendizaje**: La importancia de manejar operaciones masivas de forma asíncrona y proporcionar feedback al usuario.

## 📦 Estructura del proyecto

```
MySql/                 # Scripts de base de datos
backend/
├── node_modules/
├── app.ts             # Servidor principal
├── package.json
frontend/
├── node_modules/
├── src/
│   ├── main.ts        # Lógica principal del frontend
│   ├── index.html     # Estructura HTML
│   ├── styles.css     # Estilos CSS
├── package.json
.gitignore
docker-compose.yml     # Configuración para Docker
Dockerfile             # Configuración para el contenedor
tsconfig.json          # Configuración de TypeScript
```

## 🏃 Cómo ejecutar el proyecto

1. **Requisitos**:
   - Docker y Docker Compose instalados
   - Node.js v16+

2. **Iniciar servicios**:
```bash
docker-compose up -d
```

3. **Instalar dependencias**:
```bash
cd backend && npm install
cd ../frontend && npm install
```

4. **Ejecutar**:
```bash
# Backend
cd backend && npm start

# Frontend (en otra terminal)
cd frontend && npm run dev
```

## 🤔 ¿Por qué este proyecto destaca en mi portfolio?

Este proyecto demuestra mi capacidad para:
- Implementar soluciones full-stack completas
- Manejar problemas complejos de integridad de datos
- Escribir código limpio y mantenible con TypeScript
- Diseñar arquitecturas escalables
- Aprender y aplicar nuevos conceptos rápidamente

---

💡 **Nota para reclutadores**: Este proyecto fue desarrollado como parte de mi exploración personal de tecnologías backend y frontend. Cada reto superado representó una valiosa oportunidad de aprendizaje que ahora aplico en mis desarrollos profesionales. ¡Estoy emocionado por llevar estas habilidades a nuevos desafíos!
