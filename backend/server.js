const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Replace with your own API token
const BASEROW_API_TOKEN = "abcdefghijklmnopqrstuvwxyz1234567890"; // Replace with your actual Baserow API token

// Endpoint to handle form submission
app.post('/api/submit', async (req, res) => {
    const formData = req.body;
    const tableId = req.query.tableId;

    try {
        const response = await axios({
            method: "POST",
            url: `https://api.baserow.io/api/database/rows/table/${tableId}/?user_field_names=true`,
            headers: {
                Authorization: `Token ${BASEROW_API_TOKEN}`,
                "Content-Type": "application/json"
            },
            data: formData
        });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to fetch rows
app.get('/api/rows', async (req, res) => {
    const orderField = req.query.orderField || 'Date';
    const tableId = req.query.tableId;

    let url;
    if(orderField == 'Date' || orderField == 'Urgency'){
        url = `https://api.baserow.io/api/database/rows/table/${tableId}/?user_field_names=true&order_by=-${orderField}`;
    } else {
        url = `https://api.baserow.io/api/database/rows/table/${tableId}/?user_field_names=true&order_by=${orderField}`;
    }

    try {
        let allResults = [];
        let nextUrl = url;
        while (nextUrl) {
            const response = await axios({
                method: "GET",
                url: nextUrl,
                headers: {
                    Authorization: `Token ${BASEROW_API_TOKEN}`,
                }
            });
            allResults = allResults.concat(response.data.results);
            nextUrl = response.data.next;
        }
        res.status(200).json(allResults);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Endpoint to update a row
app.patch('/api/submit/:tableId/:id', async (req, res) => {
    const tableId = req.params.tableId; // update specific table (watchlist or watchedList)
    const id = req.params.id;
    const updateData = req.body;
    try {
        const response = await axios({
            method: 'PATCH',
            url: `https://api.baserow.io/api/database/rows/table/${tableId}/${id}/?user_field_names=true`,
            headers: {
                Authorization: `Token ${BASEROW_API_TOKEN}`,
                "Content-Type": "application/json"
            },
            data: updateData
        });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to delete a row
app.delete('/api/submit/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const response = await axios({
            method: 'DELETE',
            url: `https://api.baserow.io/api/database/rows/table/300853/${id}/`,
            headers: {
                Authorization: `Token ${BASEROW_API_TOKEN}`,
            }
        });
        res.status(200).json({ message: 'Row deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
