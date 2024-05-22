const express = require('express');
require('./config');
const multer = require('multer');

// Create an Express app
const app = express();

app.use(express.json());
const port = 5000;

const cors = require('cors');
app.use(cors());

const Course = require('./modals/AddCourse');

const Video = require('./modals/AddVideo');


//view only those course whose status is ture 
app.get('/veiwcoursebystatus', async (req, res) => {
    try {
        const courses = await Course.find({ coursestatus: true });
        res.status(200).json({ message: 'Course found whose status is Active', data: courses });
    }
    catch (err) {
        console.log(err);
        response.status(500).json({ message: 'Internal Server Error' });
    }
});


const uploadVideo = multer();
//Add Video Logic handleing 
app.post('/AddVideo', uploadVideo.none(), async (req, res) => {
    const { coursecategory, videotopic, videourl, videostatus } = req.body;

    try {
        const AddVideo = new Video({ coursecategory, videotopic, videourl, videostatus: videostatus === 'true' });
        console.log(AddVideo)
        const result = await AddVideo.save();
        if (result.length === 0) {
            return res.status(404).json({ status: false, message: 'An error has occurred' })
        }
        res.status(200).json({ status: true, message: 'Video Add Sucessfully', data: result });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.get('/viewVideos', async (req, res) => {
    try {
        const videos = await Video.find().populate('coursecategory');
        // console.log(videos);
        res.status(200).json({ message: "Video's Found Successfully", data: videos });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.get('/searchVideos/:searchKey', async (req, res) => {
    let searchKey = req.params.searchKey;

    const course = await Course.find({coursename:{ $regex: new RegExp(searchKey, "i")}})
    const courseIds = course.map(course =>course._id);
    let searchCriteria = [
        { coursecategory: { $in: courseIds } },
        { videotopic: { $regex: new RegExp(searchKey, 'i') } },
    ];
    let Videostatus = ['true', 'false'];
    if (Videostatus.includes(searchKey.toLowerCase())) {
        searchCriteria.push({ videostatus: searchKey.toLowerCase() });
    };
    try {
        const videos = await Video.find({ $or: searchCriteria }).populate('coursecategory');
        // console.log(videos);
        res.status(200).json({ message: 'Videos found successfully', data: videos });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//Geeting the vedios by using the Course Categories(which is a _id)
app.get('/searchVideosByCategory/:id', async (req, res) => {
    let categoryId = req.params.id;
    try {
        const videos = await Video.find({ coursecategory: categoryId }).populate('coursecategory');
        // console.log(videos);
        res.status(200).json({ message: 'Videos found successfully', data: videos });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.get('/getVideoby_id/:id', async (req, res) => {
    let id = req.params.id;
    try {
        let videoData = await Video.findById(id).populate('coursecategory');

        if (!videoData) {
        return res.status(404).json({ message: `Course not found by this id:- ${id}` });
        }
        res.status(200).json({ message: 'Course found successfully', data: videoData });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.put('/updatevideo_status/:id', async (req, res) => {
    const id = req.params.id;
    const newstatus = req.body.status;
    // console.log(id, newstatus);
    try {
        const video = await Video.findById(id);
        if (!video) {
            return res.status(404).json({ message: `Course not found by this id:- ${id}` });
        }
        const updatedvideo_status = await Video.updateOne(
            { _id: id }, { $set: { videostatus: newstatus } }
        )
        res.status(200).json({ message: 'Course Status updated successfully', data: updatedvideo_status });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server error' });
    }
});




//Video Update Logic Handler by using the Video ID
app.put('/UpdateVideo/:id', uploadVideo.none(), async (req, res) => {
    const id = req.params.id;
    const { coursecategory, videotopic, videourl, videostatus } = req.body;
    console.log(req.body)
    try {
        const VideoUpdated = await Video.updateOne({ _id: id },
            {
                $set: { coursecategory, videotopic, videourl, videostatus }
            });
        res.status(200).json({ message: 'Video updated successfully', data: VideoUpdated });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.delete('/DeleteVideo/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const video = await Video.findById(id);
        if (!video) {
            return res.status(404).json({ message: `Course not found by this id:- ${id}` });
        }
        // const tmp_path = path.join(__dirname, uploads, item.courseimage);
        // if (fs.existsSync(tmp_path)) {
        //     fs.unlinkSync(`${__dirname}/uploads/${course.courseimage}`);
        // }

        const result = await Video.deleteOne({ _id: id });
        res.status(200).json({ message: 'Course Deleted Successfully', data: result });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server error' });
    }
});



app.delete('/multiple_videosDelete', async (req, res) => {
    const AllIds = req.body.ids;
    console.log(AllIds);
    try {
        // const DeleteImage = await Video.find({ _id: { $in: AllIds } });
        // DeleteImage.forEach((item) => {
        //     const tmp_path = path.join(__dirname, uploads, item.courseimage);
        //     if (fs.existsSync(tmp_path)) {
        //         fs.unlinkSync(`${__dirname}/uploads/${item.courseimage}`);
        //     }

        // });// we are using forEach because 
        try {
            const DeleteVideo = await Video.deleteMany({ _id: { $in: AllIds } });
            res.status(200).json({ message: 'Course deleted successfully', data: DeleteVideo });
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