import express from 'express';
import dotenv from 'dotenv';
import { connectDB, getDB } from './db/index.js'; 
import { ObjectId } from 'mongodb'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

app.post('/products', async (req, res) => {
    try {
        const { name, price, description } = req.body;
        if (!name || !price || !description) {
            return res.status(400).json({ message: 'Все поля обязательны' });
        }

        const product = { name, price, description };
        const db = getDB();
        const result = await db.collection('products').insertOne(product);
       
        const createdProduct = { _id: result.insertedId, ...product };
        
        res.status(201).json(createdProduct); 
    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: 'Ошибка при создании продукта', error: error.message });
    }
});

app.get('/products', async (req, res) => {
    try {
        const db = getDB();
        const products = await db.collection('products').find().toArray();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении продуктов', error });
    }
});

app.get('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();
        const product = await db.collection('products').findOne({ _id: new ObjectId(id) });

        if (!product) {
            return res.status(404).json({ message: 'Продукт не найден' });
        }
        
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении продукта', error });
    }
});

app.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description } = req.body;

        if (!name || !price || !description) {
            return res.status(400).json({ message: 'Все поля обязательны' });
        }

        const db = getDB();
        const updatedProduct = { name, price, description };
        const result = await db.collection('products').updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedProduct }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Продукт не найден' });
        }

        res.status(200).json({ message: 'Продукт успешно обновлен' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при обновлении продукта', error });
    }
});

app.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();
        const result = await db.collection('products').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Продукт не найден' });
        }

        res.status(200).json({ message: 'Продукт успешно удален' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при удалении продукта', error });
    }
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(error => {
    console.error('Failed to start server', error);
});