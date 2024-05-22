const express = require('express');
require('./config');
const multer = require('multer');

// Create an Express app
const app = express();

app.use(express.json());
const port = 5000;

const cors = require('cors');
app.use(cors());


const Design = require('./modals/AddDesign');

const uploadDesign = multer();

app.post('/AddDesign', uploadDesign.none(), async (req, res) => {
    const { designname, designprice, designdescription, designstatus } = req.body;
    try {
        // Check if the design name already exists
        const existingDesign = await Design.findOne({ designname });
        if (existingDesign) {
            return res.status(400).json({ status: false, message: 'Design name already exists' });
        }

        // If design name is unique, create a new Design document
        const newDesign = new Design({ designname, designprice, designdescription, designstatus: designstatus === 'true' });
        console.log(newDesign);

        const result = await newDesign.save();
        if (!result) {
            return res.status(404).json({ status: false, message: 'An error has occurred in saving Design' });
        }
        res.status(200).json({ status: true, message: 'Design Added Successfully', data: result });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.get('/ViewDesigns', async (req, res) => {
    try {
        const designs = await Design.find();
        res.status(200).json({ status: true, message: 'Designs are Founded Successfully', data: designs });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.get('/searchDesign/:searchKey', async (req, res) => {
    let searchKey = req.params.searchKey;
    let searchCriteria = [
        { designname: { $regex: new RegExp(searchKey, 'i') } },
        { designdescription: { $regex: new RegExp(searchKey, 'i') } },
    ];
    // Check if searchKey is a number, then add price search criteria
    if (!isNaN(parseFloat(searchKey)) && isFinite(searchKey)) {
        searchCriteria.push({ designprice: searchKey });
    };

    const DesignStatus = ['true', 'false'];
    if (DesignStatus.includes(searchKey.toLowerCase())) {
        searchCriteria.push({ designstatus: searchKey.toLowerCase() });
    }
    try {
        const designs = await Design.find({ $or: searchCriteria });
        res.status(200).json({ status: true, message: 'Designs founded Sucessfully', data: designs });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/getDesign_byid/:id', async (req, res) => {
    let id = req.params.id;
    try {
        let design = await Design.findById(id);
        if (!design) {
            return res.status(404).json({ message: `Design not found by this id:- ${id}` });
        }
        res.status(200).json({ message: 'Slider found successfully', data: design })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.put('/updateDesign_status/:id', async (req, res) => {
    const id = req.params.id;
    const newstatus = req.body.status;
    // console.log(id, newstatus);
    try {
        let design = await Design.findById(id);
        if (design) {
            return res.status(404).json({ message: `Design not found by this id:- ${id}` });
        }
        const updatedDesign_status = await Design.updateOne(
            { _id: id }, { $set: { designstatus: newstatus } })
        res.status(200).json({ message: 'Design Status updated successfully by using ID', data: updatedDesign_status });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// app.put('/updateDesign/:id', uploadDesign.none(), async (req, res) => {
//     const id = req.params.id;
//     const { designname, designprice, designdescription, designstatus } = req.body;
    
//     try {
//         const UpdatedDesign = await Design.updateOne({ _id: id },
//             {
//                 $set: { designname, designprice, designdescription, designstatus }
//             });
//         res.status(200).json({ message: 'Design is updated successfully by using ID', data: UpdatedDesign });
//     }
//     catch (err) {
//         console.log(err);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });


app.put('/updateDesign/:id', uploadDesign.none(), async (req, res) => {
    const id = req.params.id;
    const { designname, designprice, designdescription, designstatus } = req.body;
    try {
        // Check if the design name already exists except for the design being updated
        const existingDesign = await Design.findOne({ designname, _id: { $ne: id } });
        if (existingDesign) {
            return res.status(400).json({ status: false, message: 'Design name already exists' });
        }

        // If design name is unique, proceed with updating the design
        const UpdatedDesign = await Design.updateOne({ _id: id }, {
            $set: { designname, designprice, designdescription, designstatus }
        });

        res.status(200).json({ message: 'Design is updated successfully by using ID', data: UpdatedDesign, status: true});
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.delete('/DeleteDesign/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const design = await Design.findById(id);
        if (!design) {
            return res.status(404).json({ message: `Design not found by this id:- ${id}` });
        }
        // const tmp_path = path.join(__dirname, uploads, design.designimage);
        // if (fs.existsSync(tmp_path)) {
        //     fs.unlinkSync(`${__dirname}/uploads/${design.designimage}`);
        // }
        const result = await Design.deleteOne({ _id: id });
        res.status(200).json({ message: 'Design Deleted Successfully', data: result });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server error' });
    }
});


app.delete('/multiple_DesignsDelete', async (req, res) => {
    const AllIds = req.body.ids;
    console.log(AllIds);
    try {
        // const DeleteImage = await Design.find({ _id: { $in: AllIds } });
        // DeleteImage.forEach((item) => {
        //     const tmp_path = path.join(__dirname, design, item.designimage);
        //     if (fs.existsSync(tmp_path)) {
        //         fs.unlinkSync(`${__dirname}/design/${item.designimage}`);
        //     }
        // });
        try {
            const Deletedesign = await Design.deleteMany({ _id: { $in: AllIds } });
            res.status(200).json({ message: 'Design deleted successfully', data: Deletedesign });
        }
        catch (err) {
            console.log(err);
            res.status(400).json({ message: 'Error in Deleting the course' });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server error' });
    }
})

//view only those Designs whose status is ture 
app.get('/ViewDesignsbystatus', async (req, res) => {
    try {
        const designs = await Design.find({ designstatus: true });
        res.status(200).json({ status: true, message: 'Designs founded whose status are Active', data: designs });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.listen(port, () => {
    console.log(`the server is listening on ${port}`);
});
