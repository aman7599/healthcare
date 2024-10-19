const express = require('express');
const mongoose = require('mongoose');
const Healthcare = require('./models/healthcare');
const { body, validationResult } = require('express-validator');

const app = express();
const port = 3000;

const db = 'mongodb+srv://aman1234:aman1234@cluster0.cujup.mongodb.net/'
mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connection Successful');
}).catch((err) => console.log('No connection:', err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello, Healthcare API');
});

app.get('/read', async (req, res) => {
    try {
        let services = await Healthcare.find({});
        res.status(200).send(services);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch services' });
    }
});

app.get('/readid/:id', async (req, res) => {
    try {
        let service = await Healthcare.findById(req.params.id).lean().select('-__v');
        if (!service) {
            return res.status(404).send({ error: 'Service not found' });
        }
        res.status(200).send(service);
    } catch (error) {
        res.status(500).send({ error: 'Failed to retrieve service' });
    }
});

app.post('/create', [
    body('servicename').isString().notEmpty().withMessage('Service name must be a string'),
    body('description').isString().notEmpty().withMessage('Description must be a string'),
    body('price').isNumeric().notEmpty().withMessage('Price must be a number')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let newService = new Healthcare({
            servicename: req.body.servicename,
            description: req.body.description,
            price: req.body.price
        });
        await newService.save();
        res.status(201).send(newService);
    } catch (error) {
        res.status(500).send({ error: 'Failed to create service' });
    }
});

app.put('/update/:id', [
    body('servicename').isString().trim().notEmpty().withMessage('Service name must be a non-empty string'),
    body('description').isString().trim().notEmpty().withMessage('Description must be a non-empty string'),
    body('price').isNumeric().withMessage('Price must be a number')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let updatedService = await Healthcare.findByIdAndUpdate(
            req.params.id,
            {
                servicename: req.body.servicename,
                description: req.body.description,
                price: req.body.price
            },
            { new: true }
        ).lean().select('-__v');
        res.status(200).send(updatedService);
    } catch (error) {
        res.status(500).send({ error: 'Failed to update service' });
    }
});

app.delete('/delete/:id', async (req, res) => {
    try {
        const service = await Healthcare.findById(req.params.id);
        if (!service) {
            return res.status(404).send({ error: 'Service not found' });
        }
        await Healthcare.findByIdAndDelete(req.params.id);
        res.status(200).send({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to delete service' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
