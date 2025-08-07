# Inventory Management System - Node.js Backend & TypeScript Frontend

![Technologies Used](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)

A complete inventory management system featuring a Node.js/Express backend and TypeScript frontend, including product CRUD operations, SQL transaction-based order processing, and real-time low stock visualization.

## ✨ Key Features

- **Robust Backend**: REST API with Express.js and TypeScript
- **Modern Frontend**: Responsive interface using pure TypeScript (no frameworks)
- **Database**: MySQL with connection pooling and transactions
- **Complete Functionality**:
  - Product CRUD operations
  - ACID-compliant order processing
  - Low stock alerts
  - Real-time search and filtering
- **Clean Architecture**: Clear separation between frontend and backend

## 🛠️ Tech Stack

- **Backend**:
  - Node.js + Express
  - TypeScript
  - MySQL (mysql2/promise)
  - CORS for frontend-backend communication

- **Frontend**:
  - Pure TypeScript (no frameworks)
  - Modern responsive CSS
  - Fetch API for backend communication

- **Tools**:
  - Vite for frontend
  - Docker (compose and Dockerfile)
  - Git for version control

## 🚀 Technical Challenges & Learnings

### 1. Implementing SQL Transactions for Orders

**Challenge**: Ensuring data consistency when processing orders and updating stock simultaneously.

**Solution**: Implemented ACID-compliant MySQL transactions:
```typescript
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  
  // 1. Insert order
  await connection.query('INSERT INTO Orders...');
  
  // 2. Update stock (with validation)
  const [result] = await connection.query(
    'UPDATE Products SET stock = stock - ? WHERE id = ? AND stock >= ?',
    [quantity, product_id, quantity]
  );
  
  if (result.affectedRows === 0) {
    throw new Error('Insufficient stock');
  }
  
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
```

**Learning**: Gained deep understanding of how transactions ensure data integrity in critical operations.

### 2. Frontend-Backend Communication with TypeScript

**Challenge**: Maintaining type safety between TypeScript frontend and REST API.

**Solution**: Created shared interfaces and strict validation:
```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

// API calls
async function loadProducts(): Promise<Product[]> {
  const response = await fetch('/products');
  return await response.json() as Product[];
}
```

**Learning**: TypeScript significantly improves maintainability by catching errors at compile time.

### 3. Performance with Large Data Volumes

**Challenge**: Inserting 10,000 test orders without blocking the application.

**Solution**: Implemented batch processing with visual feedback:
```javascript
for (let i = 1; i <= 10000; i++) {
  // Process order...
  
  if (i % 1000 === 0) {
    console.log(`✅ ${i} orders inserted...`);
  }
}
```

**Learning**: The importance of handling bulk operations asynchronously and providing user feedback.

## 📦 Project Structure

```
MySql/                 
backend/
├── node_modules/
├── app.ts             # Main server
├── package.json
frontend/
├── node_modules/
├── src/
│   ├── main.ts        # Frontend logic
│   ├── index.html     # HTML structure
│   ├── styles.css     # CSS styles
├── package.json
.gitignore
docker-compose.yml     # Docker configuration
Dockerfile             # Container setup
tsconfig.json          # TypeScript configuration
```

## � How to Run the Project

1. **Requirements**:
   - Docker and Docker Compose installed
   - Node.js v16+

2. **Start services**:
```bash
docker-compose up -d
```

3. **Install dependencies**:
```bash
cd backend && npm install
cd ../frontend && npm install
```

4. **Run**:
```bash
# Backend
cd backend && npm start

# Frontend (in another terminal)
cd frontend && npm run dev
```

## 🤔 Why This Project Stands Out in My Portfolio

This project demonstrates my ability to:
- Implement complete full-stack solutions
- Handle complex data integrity problems
- Write clean, maintainable TypeScript code
- Design scalable architectures
- Quickly learn and apply new concepts

---

💡 **Note to Recruiters**: This project was developed as part of my personal exploration of backend and frontend technologies. Each challenge overcome represented valuable learning that I now apply in professional development. I'm excited to bring these skills to new challenges!
