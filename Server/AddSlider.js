const express = require('express');
require('./config');
const multer = require('multer');

const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
const port = 5000;

const cors = require('cors');
app.use(cors());


const Slider = require('./modals/AddSlider');

const store_sliderimage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'sliders');
    }, filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
});
const uploadSlider = multer({ storage: store_sliderimage }).single('image');
app.use('/sliders', express.static(path.join(__dirname, 'sliders')));


app.post('/addslider', uploadSlider, async (req, res) => {
    try {
        const { slidername, slidersubheading, sliderdecription, slidertatus } = req.body;
        const sliderimage = req.file.filename;

        const newSlider = new Slider({
            slidername, slidersubheading, sliderdecription, slidertatus, sliderimage
        });

        const result = await newSlider.save();
        if (!result) {
            return res.status(404).json({ status: false, message: 'An error has occurred' });
        }
        res.status(200).json({ status: true, message: 'Team Member Added successfully', data: result });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/viewslider', async (req, res) => {
    try {
        const slides = await Slider.find();
        const finalSlides = slides.map((slide) => ({
            ...slide._doc, sliderimage: `${req.protocol}://${req.get('host')}/sliders/${slide.sliderimage}`
        }));
        res.status(200).json({ message: 'Slides found Successfully', data: finalSlides });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//view only those slider whose status is 'Active'
app.get('/veiwsliderbystatus',async(req,res)=>{
    try{
        const Sliders = await Slider.find({slidertatus:true});
        const finalSlides = Sliders.map((slides)=>({
            ...slides._doc,sliderimage:`${req.protocol}://${req.get('host')}/sliders/${slides.sliderimage}`
        }));
        res.status(200).json({ message:'Sliders founded whose status are Active',data:finalSlides});
    }catch(err){
        console.log(err);
        response.status(500).json({ message: 'Internal Server Error' });
    }
});


app.get('/searchSlider/:searchKey', async (req, res) => {
    let searchKey = req.params.searchKey;
    let searchCriteria = [
        { slidername: { $regex: new RegExp(searchKey, 'i') } },
        { slidersubheading: { $regex: new RegExp(searchKey, 'i') } },
        { sliderdecription: { $regex: new RegExp(searchKey, 'i') } },
    ];

    let Sliderstatus = ['true', 'false'];
    if (Sliderstatus.includes(searchKey.toLowerCase())) {
        searchCriteria.push({ slidertatus: searchKey.toLowerCase() });
    };
    try {
        const slides = await Slider.find({ $or: searchCriteria });
        const finalSlides = slides.map((slide) => ({
            ...slide._doc, sliderimage: `${req.protocol}://${req.get('host')}/sliders/${slide.sliderimage}`
        }));
        res.status(200).json({ message: 'Slides found Successfully', data: finalSlides });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get('/getSlide_byid/:id', async(req, res)=>{
    let id = req.params.id;
    try {
        let Slide = await Slider.findById(id).lean();
        Slide = { ...Slide, sliderimage: `${req.protocol}://${req.get('host')}/sliders/${Slide.sliderimage}`}
        if (!Slide) {
            return res.status(404).json({ message: `Slider not found by this id:- ${id}` });
        }
        res.status(200).json({ message: 'Slider found successfully', data: Slide });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.put('/UpdateSlider/:_id', uploadSlider, async (req, res) => {
    const _id = req.params._id;
    const { slidername, slidersubheading, sliderdecription, slidertatus } = req.body;
    let sliderimage;
    if (req.file) {
        sliderimage = req.file.filename;
        const existingSlider = await Slider.findById(_id);
        if (!existingSlider) {
            return res.status(404).json({ message: `Slide not found by this id:- ${_id}` });
        }
        try {
            fs.unlinkSync(`sliders/${existingSlider.sliderimage}`);
        } catch (err) {
            console.log(`Error in deleting old image:- ${err}`);
        }
    } else {
        const existingSlider = await Slider.findById(_id);
        if (!existingSlider) {
            return res.status(400).json({ message: `Slide not found by this id:- ${_id}` });
        }
        sliderimage = existingSlider.sliderimage;
    }

    try {
        const SliderUpdated = await Slider.updateOne({ _id }, {
            $set: {
                slidername, slidersubheading, sliderdecription, slidertatus, sliderimage
            }
        });
        res.status(200).json({ message: 'Slider updated successfully', data: SliderUpdated });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.put('/updateSliderStatus/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const newstatus = req.body.status;
        const slider = await Slider.findById(id);
        if (!slider) {
            return res.status(404).json({ message: `Team Member not found by this id:- ${id}` });
        }
        const updatedSliderStatus = await Slider.updateOne(
            { _id: id }, { $set: { slidertatus: newstatus } }
        );
        res.status(200).json({ message: 'Team Member Status updated successfully', data: updatedSliderStatus });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message:"Internal Server Error"})
    }
});
app.delete('/deleteSlider/:id',async (req, res)=>{
    try {
        const id = req.params.id;
        // Find the team member by ID
        const slide = await Slider.findById(id);
        if (!slide) {
            return res.status(404).json({ message:`Slider not found by this id:- ${id}`});
        }
        // Delete the team member's image file from the server
        const tmp_path = path.join(__dirname, 'sliders', slide.sliderimage);
        if (fs.existsSync(tmp_path)) {
            fs.unlinkSync(`${__dirname}/sliders/${slide.sliderimage}`);
        }

        // Delete the team member from the database
        const result = await Slider.deleteOne({ _id: id });
        res.status(200).json({ message: 'Slider Deleted Successfully', data: result });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server error' });
    }
});

app.delete('/multipleSliderDelete',async (req, res) => {
    try{
        const AllIds = req.body.ids;
        const DeleteImage = await Slider.find({ _id: { $in: AllIds } });
        DeleteImage.forEach((slide)=>{
            const tmp_path = path.join(__dirname, 'sliders', slide.sliderimage);
        if (fs.existsSync(tmp_path)) {
            fs.unlinkSync(`${__dirname}/sliders/${slide.sliderimage}`);
        }
        });
        const DeleteSliders = await Slider.deleteMany({ _id: { $in: AllIds } });
        res.status(200).json({ message: 'Sliders deleted successfully', data: DeleteSliders });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server' });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`the server is listening on ${port}`);
});
