// Import necessary modules
const express = require('express');
require('./config');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Create an Express app
const app = express();

app.use(express.json());
const port = 5000;

const cors = require('cors');
app.use(cors());

const Card = require('./modals/AddCard');

// Set up Multer storage for handling file uploads
const store_cardimage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Define the destination directory for storing uploaded images
        cb(null, 'cards');
    },
    filename: function (req, file, cb) {
        // Generate a unique filename for the uploaded image
        cb(null, Date.now() + file.originalname);
    }
});

// Set up Multer middleware to handle single image uploads
const uploadCard = multer({ storage: store_cardimage }).single('image');

// Serve uploaded images statically for viewing
app.use('/cards', express.static(path.join(__dirname, 'cards')));

// Route to add a new card
app.post('/addCard', uploadCard, async (req, res) => {
    try {
        // Extract data from request body
        const { mainHeading, subHeading, cardStatus } = req.body;
        const cardImage = req.file.filename;

        // Create a new Card object
        const newCard = new Card({
            mainHeading,
            subHeading,
            cardImage,
            cardStatus: cardStatus === 'true'
        });
        console.log(newCard);
        // Save the new card to the database
        const result = await newCard.save();

        // Check if the save operation was successful
        if (!result) {
            return res.status(404).json({ status: false, message: 'An error has occurred' });
        }

        // Respond with success message and data
        res.status(200).json({ status: true, message: 'Card Added successfully', data: result });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route to view all cards
app.get('/viewCards', async (req, res) => {
    try {
        // Retrieve all cards from the database
        const cards = await Card.find();

        // Modify each card's image path to include the host URL
        const finalCards = cards.map((card) => ({
            ...card._doc, cardImage: `${req.protocol}://${req.get('host')}/cards/${card.cardImage}`
        }));
        // Respond with success message and data
        res.status(200).json({ message: 'Cards Found Successfully', data: finalCards });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/viewCardsbystatus', async (req, res) => {
    try {
        const cards = await Card.find({ cardStatus: true });
        const finalCards = cards.map((card) => ({
            ...card._doc, cardImage: `${req.protocol}://${req.get('host')}/cards/${card.cardImage}`
        }));
        // Respond with success message and data
        res.status(200).json({ message:'Cards founded whose status are Active',
        data: finalCards });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route to update a card by ID
app.put('/updateCard/:_id', uploadCard, async (req, res) => {
    const _id = req.params._id;
    const { mainHeading, subHeading, cardStatus } = req.body;
    let cardImage;

    // Check if a file is uploaded
    if (req.file) {
        // If a file is uploaded, set the new image
        cardImage = req.file.filename;

        // Fetch existing card to get old image path
        const existingCard = await Card.findById(_id);
        if (!existingCard) {
            return res.status(404).json({ message: `Card not found by this id:- ${_id}` });
        }

        // Delete the old card image file from (cards) folder
        try {
            fs.unlinkSync(`cards/${existingCard.cardImage}`);
        } catch (err) {
            console.error('Error deleting old image:', err);
        }
    } else {
        // If no file is uploaded, retain the existing image
        const existingCard = await Card.findById(_id);
        if (!existingCard) {
            return res.status(404).json({ message: `Card not found by this id:- ${_id}` });
        }
        cardImage = existingCard.cardImage;
    }

    try {
        const cardUpdated = await Card.updateOne({ _id }, {
            $set: {
                mainHeading,
                subHeading,
                cardImage,
                cardStatus
            }
        });
        res.status(200).json({ message: 'Card updated successfully', data: cardUpdated });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route to delete a card by ID
app.delete('/deleteCard/:id', async (req, res) => {
    try {
        const id = req.params.id;
        // Find the card by ID
        const card = await Card.findById(id);
        if (!card) {
            return res.status(404).json({ message: `Card not found by this id:- ${id}` });
        }
        // Delete the card's image file from the server
        const tmp_path = path.join(__dirname, 'cards', card.cardImage);
        if (fs.existsSync(tmp_path)) {
            fs.unlinkSync(`${__dirname}/cards/${card.cardImage}`);
        }

        // Delete the card from the database
        const result = await Card.deleteOne({ _id: id });
        res.status(200).json({ message: 'Card Deleted Successfully', data: result });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server error' });
    }
});

// Route to update a card's status
app.put('/updateCardStatus/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const newStatus = req.body.status;
        // Find the card by ID
        const card = await Card.findById(id);
        if (!card) {
            return res.status(404).json({ message: `Card not found by this id:- ${id}` });
        }
        // Update the card's status
        const updatedCardStatus = await Card.updateOne(
            { _id: id }, { $set: { cardStatus: newStatus } }
        );
        res.status(200).json({ message: 'Card Status updated successfully', data: updatedCardStatus });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server error' });
    }
});

// Route to delete multiple cards by IDs
app.delete('/multipleCardDelete', async (req, res) => {
    try {
        const allIds = req.body.ids;
        // Find all cards to be deleted
        const deleteCards = await Card.find({ _id: { $in: allIds } });
        // Delete each card's image file from the server
        deleteCards.forEach((item) => {
            const tmpPath = path.join(__dirname, 'cards', item.cardImage);
            if (fs.existsSync(tmpPath)) {
                fs.unlinkSync(`${__dirname}/cards/${item.cardImage}`);
            }
        });
        // Delete the cards from the database
        const deleteResult = await Card.deleteMany({ _id: { $in: allIds } });
        res.status(200).json({ message: 'Cards deleted successfully', data: deleteResult });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server error' });
    }
});

// Route to get a card by ID
app.get('/getCardById/:id', async (req, res) => {
    try {
        const id = req.params.id;
        // Find the card by ID
        let card = await Card.findById(id).lean();
        card = { ...card, cardImage: `${req.protocol}://${req.get('host')}/cards/${card.cardImage}` }
        if (!card) {
            return res.status(404).json({ message: `Card not found by this id:- ${id}` });
        }
        res.status(200).json({ message: 'Card found successfully', data: card });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route to search cards
app.get('/searchCards/:searchKey', async (req, res) => {
    let searchKey = req.params.searchKey;
    const searchCriteria = [
        { mainHeading: { $regex: new RegExp(searchKey, 'i') } },
        { subHeading: { $regex: new RegExp(searchKey, 'i') } },
    ];

    let cardStatus = ['true', 'false',];
    if (cardStatus.includes(searchKey.toLowerCase())) {
        searchCriteria.push({ cardStatus: searchKey.toLowerCase() });
    }

    try {
        const cards = await Card.find({ $or: searchCriteria });
        const finalCards = cards.map((card) => ({
            ...card._doc, cardImage: `${req.protocol}://${req.get('host')}/cards/${card.cardImage}`
        }));
        res.status(200).json({ message: 'Cards Found Successfully', data: finalCards });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`the server is listening on ${port}`);
});
