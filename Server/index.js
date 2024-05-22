const express = require('express');
require('./config');
const Admin = require('./modals/Admin');
const Course = require('./modals/AddCourse');
const Video = require('./modals/AddVideo');
const Team = require('./modals/AddTeam');
const Slider = require('./modals/AddSlider');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const jwtkey = 'lms-wsb_67';
const app = express();

app.use(express.json());
const port = 5000;

const cors = require('cors');
app.use(cors());


//Verify the Jwt
const Verifyjwt = (req, res, next) => {
    let auth = req.headers.authorization
    auth = auth.split(' ')[1];
    if (!auth) {
        res.status(401).json({ status: false, message: 'Data Fecth Failed' });
    };
    jwt.verify(auth, jwtkey, (error, decode) => {
        if (error) {
            return res.status(402).json({ status: false, message: 'Something went wrong' });
        }
        req.decode = decode;
        next();
    });
};

const storage_image = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
});
//Image Path to store the Uploaded image teams folder
const store_teamimage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'teams');
    }, filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
});
//Image Path to store the Uploaded image sliders folder
const store_sliderimage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'sliders');
    }, filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
});

// to save the image by using multer and use as middleware
const uploadCourse = multer({ storage: storage_image }).single('image');

const uploadTeam = multer({ storage: store_teamimage }).single('image');


const uploadSlider = multer({ storage: store_sliderimage }).single('image');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/teams', express.static(path.join(__dirname, 'teams')));

app.use('/sliders', express.static(path.join(__dirname, 'sliders')));

// Upload Course logic handling
app.post('/addcourse', uploadCourse, async (request, response) => {
    const { coursename, courseprice, courseduration, coursedecription, coursestatus } = request.body;
    const courseimage = request.file.filename;
    const newcourse = new Course({
        coursename,
        courseprice,
        courseduration,
        coursedecription,
        courseimage,
        coursestatus: coursestatus === 'true'
    });
    console.log(newcourse);

    try {
        const result = await newcourse.save();
        if (result.length === 0) {
            return response.status(404).json({ status: false, message: 'An error has occurred' });
        }
        response.status(200).json({ status: true, message: 'Added course successfully', data: result });
    }
    catch (err) {
        console.log(err);
        response.status(500).json({ message: 'Internal Server Error' });
    };

});

// view All Courses logic handling
app.get('/veiwcourses', Verifyjwt, async (request, response) => {
    try {
        const courses = await Course.find();
        const finalCourses = courses.map((course) => ({
            ...course._doc, courseimage: `${request.protocol}://${request.get('host')}/uploads/${course.courseimage}`
        }))
        response.status(200).json({ message: 'Courses Found Successfully', data: finalCourses });
    }
    catch (err) {
        console.log(err);
        response.status(500).json({ message: 'Internal Server Error' });
    };
});

app.get('/searchcourses/:searchkey', async (request, response) => {
    let searchKey = request.params.searchkey;
    let searchCriteria = [
        { coursename: { $regex: new RegExp(searchKey, "i") } },
        { coursedecription: { $regex: new RegExp(searchKey, "i") } },
        { courseduration: { $regex: new RegExp(searchKey, "i") } },

    ];
    // Check if searchKey is a number, then add price search criteria
    if (!isNaN(parseFloat(searchKey)) && isFinite(searchKey)) {
        searchCriteria.push({ courseprice: searchKey });
    };

    const CourseStatuses = ['true', 'false']; //Add more statuses as needed
    if (CourseStatuses.includes(searchKey.toLowerCase())) {
        searchCriteria.push({ coursestatus: searchKey.toLowerCase() });
    };
    console.log(searchKey);

    try {
        const courses = await Course.find({ $or: searchCriteria });

        const finalCourses = courses.map((course) => ({
            ...course._doc, courseimage: `${request.protocol}://${request.get('host')}/uploads/${course.courseimage}`
        }));
        console.log(finalCourses);
        response.status(200).json({ message: 'Courses Found Successfully', data: finalCourses });
    } catch (err) {
        console.log(err);
        response.status(500).json({ message: 'Internal Server Error' });
    }
});




//View Course Logic Handler by using the Course ID
app.get('/coursebyid/:id', async (req, res) => {
    let id = req.params.id;
    try {
        let course = await Course.findById(id).lean();
        course = { ...course, courseimage: `${req.protocol}://${req.get('host')}/uploads/${course.courseimage}` }
        if (!course) {
            return res.status(404).json({ message: `Course not found by this id:- ${id}` });
        }
        res.status(200).json({ message: 'Course found successfully', data: course });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



app.put('/UpdateCourse/:_id', uploadCourse, async (req, res) => {
    const _id = req.params._id; // Corrected parameter extraction
    const { coursename, courseprice, courseduration, coursedecription, coursestatus } = req.body;
    let courseimage;

    // Check if a file is uploaded
    if (req.file) {
        courseimage = req.file.filename;

        // Delete the old image file if it exists
        try {
            const existingCourse = await Course.findById(_id);
            if (existingCourse.courseimage) {
                fs.unlinkSync(`uploads/${existingCourse.courseimage}`);
            }
        } catch (err) {
            console.log("Error deleting old image:", err);
            return res.status(400).json({ message: `Error deleting old image by this id:- ${_id}` });
        }
    } else {
        // If no file is uploaded, retain the existing image
        const existingCourse = await Course.findById(_id);
        if (!existingCourse) {
            return res.status(400).json({ message: `Course not found by this id:- ${_id}` });
        }
        courseimage = existingCourse.courseimage;
    }
    try {
        const CourseUpdated = await Course.updateOne({ _id }, {
            $set: {
                coursename, courseprice, courseduration, coursedecription, courseimage, coursestatus
            }
        });
        res.status(200).json({ message: 'Course updated successfully', data: CourseUpdated });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Delete Course from Database by using the Course ID
app.delete('/DeleteCourse/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: `Course not found by this id:- ${id}` });
        }
        const tmp_path = path.join(__dirname, 'teams', course.courseimage);
        if (fs.existsSync(tmp_path)) {
            fs.unlinkSync(`${__dirname}/uploads/${course.courseimage}`);
        }
        const result = await Course.deleteOne({ _id: id });
        res.status(200).json({ message: 'Course Deleted Successfully', data: result });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server error' });
    }
});


//Updateing the Course Status by using Course id and Current Course status
app.put('/updatecourse_status/:id', async (req, res) => {
    const id = req.params.id;
    const newstatus = req.body.status;
    console.log(id, newstatus);
    try {
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: `Course not found by this id:- ${id}` });
        }
        const updatedcourse_status = await Course.updateOne(
            { _id: id }, { $set: { coursestatus: newstatus } }
        )
        res.status(200).json({ message: 'Course Status updated successfully', data: updatedcourse_status });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server error' });
    }
});



//Multiple Courses Delete by using Id's
app.delete('/multiple_coursesDelete', async (req, res) => {
    const AllIds = req.body.ids;
    console.log(AllIds);
    try {
        const DeleteImage = await Course.find({ _id: { $in: AllIds } });
        DeleteImage.forEach((item) => {
            const tmp_path = path.join(__dirname, 'uploads', item.courseimage);
            if (fs.existsSync(tmp_path)) {
                fs.unlinkSync(`${__dirname}/uploads/${item.courseimage}`);
            }

        });// we are using forEach because 
        try {
            const DeleteCourse = await Course.deleteMany({ _id: { $in: AllIds } });
            res.status(200).json({ message: 'Course deleted successfully', data: DeleteCourse });
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



app.post('/addTeamMember', uploadTeam, async (request, response) => {
    const { membername, membercategory, memberstatus } = request.body;
    const memberimage = request.file.filename;

    const newTeam = new Team({
        membername,
        membercategory,
        memberimage,
        memberstatus: memberstatus === 'true'
    });
    console.log(newTeam);

    try {
        const result = await newTeam.save();
        if (result.length === 0) {
            return response.status(404).json({ status: false, message: 'An error has occurred' });
        }
        response.status(200).json({ status: true, message: 'Team Member Added successfully', data: result });
    }
    catch (err) {
        console.log(err);
        response.status(500).json({ message: 'Internal Server Error' });
    };

});

// view All Team Member logic handling
app.get('/veiwTeam_members', async (request, response) => {
    try {
        const teams = await Team.find();
        const finalTeams = teams.map((team) => ({
            ...team._doc, memberimage: `${request.protocol}://${request.get('host')}/teams/${team.memberimage}`
        }))
        response.status(200).json({ message: 'Team Member Found Successfully', data: finalTeams });
    }
    catch (err) {
        console.log(err);
        response.status(500).json({ message: 'Internal Server Error' });
    };
});


app.get('/searchTeamsMembers/:searchKey', async (req, res) => {
    let searchKey = req.params.searchKey;
    let searchCriteria = [
        { membername: { $regex: new RegExp(searchKey, 'i') } },
        { membercategory: { $regex: new RegExp(searchKey, 'i') } },
    ];

    let Team_memberstatus = ['true', 'false'];
    if (Team_memberstatus.includes(searchKey.toLowerCase())) {
        searchCriteria.push({ memberstatus: searchKey.toLowerCase() });
    };
    try {
        const teams = await Team.find({ $or: searchCriteria });
        const finalTeams = teams.map((team) => ({
            ...team._doc, memberimage: `${req.protocol}://${req.get('host')}/teams/${team.memberimage}`
        }))
        res.status(200).json({ message: 'Team Member Found Successfully', data: finalTeams });
    }
    catch (err) {
        console.log(err);
        res.status(200).json({ message: "Internal Server Error" });
    }
});


app.get('/Team_memberbyid/:id', async (req, res) => {
    let id = req.params.id;
    try {
        let Team_member = await Team.findById(id).lean();
        Team_member = { ...Team_member, memberimage: `${req.protocol}://${req.get('host')}/teams/${Team_member.memberimage}` }
        if (!Team_member) {
            return res.status(404).json({ message: `Team member not found by this id:- ${id}` });
        }
        res.status(200).json({ message: 'Team Member found successfully', data: Team_member });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




app.put('/UpdateTeamMember/:_id', uploadTeam, async (req, res) => {
    const _id = req.params._id; // Corrected parameter extraction
    const { membername, membercategory, memberstatus } = req.body;
    let memberimage;

    // Check if a file is uploaded
    if (req.file) {
        // If a file is uploaded, set the new image
        memberimage = req.file.filename;

        // Fetch existing team member to get old image path
        const existingTeam = await Team.findById(_id);
        if (!existingTeam) {
            return res.status(400).json({ message: `Team Member not found by this id:- ${_id}` });
        }

        // Delete the old image file from uploads folder
        try {
            fs.unlinkSync(`teams/${existingTeam.memberimage}`);
        } catch (err) {
            console.error('Error deleting old image:', err);
        }
    } else {
        // If no file is uploaded, retain the existing image
        const existingTeam = await Team.findById(_id);
        if (!existingTeam) {
            return res.status(400).json({ message: `Team Member not found by this id:- ${_id}` });
        }
        memberimage = existingTeam.memberimage;
    }

    try {
        const TeamUpdated = await Team.updateOne({ _id }, {
            $set: {
                membername,
                membercategory,
                memberimage,
                memberstatus
            }
        });
        res.status(200).json({ message: 'Team Member updated successfully', data: TeamUpdated });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



// Delete Team Member from Database by using the Team Member ID
app.delete('/DeleteTeam_Member/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const Team_member = await Team.findById(id);
        if (!Team_member) {
            return res.status(404).json({ message: `Team Member not found by this id:- ${id}` });
        }
        const tmp_path = path.join(__dirname, 'teams', Team_member.memberimage);
        if (fs.existsSync(tmp_path)) {
            fs.unlinkSync(`${__dirname}/teams/${Team_member.memberimage}`);
        }
        const result = await Team.deleteOne({ _id: id });
        res.status(200).json({ message: 'Team Member Deleted Successfully', data: result });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server error' });
    }
});


//Updateing the Team Member Status by using Team member id and Current Team Meamber status
app.put('/updateTeamMember_status/:id', async (req, res) => {
    const id = req.params.id;
    const newstatus = req.body.status;
    console.log(id, newstatus);
    try {
        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({ message: `Team Member not found by this id:- ${id}` });
        }
        const updatedMwmber_status = await Team.updateOne(
            { _id: id }, { $set: { memberstatus: newstatus } }
        )
        res.status(200).json({ message: 'Team Member Status updated successfully', data: updatedMwmber_status });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server error' });
    }
});



//Multiple Team Member Delete by using Id's
app.delete('/Deletemultiple_Team_members', async (req, res) => {
    const AllIds = req.body.ids;
    console.log(AllIds);
    try {
        const DeleteImage = await Team.find({ _id: { $in: AllIds } });
        DeleteImage.forEach((item) => {
            const tmp_path = path.join(__dirname, 'teams', item.memberimage);
            if (fs.existsSync(tmp_path)) {
                fs.unlinkSync(`${__dirname}/teams/${item.memberimage}`);
            }

        });// we are using forEach because 
        try {
            const DeleteTeam_members = await Team.deleteMany({ _id: { $in: AllIds } });
            res.status(200).json({ message: 'Team Members deleted successfully', data: DeleteTeam_members });
        }
        catch (err) {
            console.log(err);
            res.status(400).json({ message: 'Error in Deleting the Team members' });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server error' });
    }
});

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
            return res.status(400).json({ message: `Slide not found by this id:- ${_id}` });
        }
        try {
            fs.unlinkSync(`sliders/${existingSlider.sliderimage}`);
        } catch (err) {
            console.error('Error deleting old image:', err);
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

app.put('/updateSlider_Status/:id', async (req, res) => {
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

//Handling the login page Admin form 
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userData = await Admin.find({ username: username });
        // console.log('Api is Called', userData);
        if (userData.length === 0) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        if (userData[0].password !== password) {
            return res.status(501).json({ status: false, message: 'Password not match' });
        }
        jwt.sign({ username }, jwtkey, { expiresIn: 60 * 60 * 24 * 7 }, (error, token) => {
            if (error) {
                res.status(202).json({ status: false, message: 'Login Failed' });
            } else {
                res.status(200).json({ status: true, message: 'User Login Sucessfully', data: userData, auth: token });
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: false, message: 'internal Server error' });
    }
});





app.get('/searchAll/:searchKey', async (req, res) => {
    const searchKey = req.params.searchKey;

    const courseCriteria = [
        { coursename: { $regex: new RegExp(searchKey, 'i') } },
        { coursedecription: { $regex: new RegExp(searchKey, 'i') } },
        { courseduration: { $regex: new RegExp(searchKey, 'i') } },
    ];
     // Check if searchKey is a number, then add price search criteria
     if (!isNaN(parseFloat(searchKey)) && isFinite(searchKey)) {
        courseCriteria.push({ courseprice: searchKey });
    };
    const teamCriteria = [
        { membername: { $regex: new RegExp(searchKey, 'i') } },
        { membercategory: { $regex: new RegExp(searchKey, 'i') } },
    ];

    const sliderCriteria = [
        { slidername: { $regex: new RegExp(searchKey, 'i') } },
        { slidersubheading: { $regex: new RegExp(searchKey, 'i') } },
        { sliderdecription: { $regex: new RegExp(searchKey, 'i') } },
    ];


    const courseStatuses = ['true', 'false'];
    const teamMemberStatuses = ['true', 'false'];
    const sliderStatuses = ['true', 'false'];
    const Videostatus = ['true', 'false'];

    if (courseStatuses.includes(searchKey.toLowerCase())) {
        courseCriteria.push({ coursestatus: searchKey.toLowerCase() });
    }

    if (teamMemberStatuses.includes(searchKey.toLowerCase())) {
        teamCriteria.push({ memberstatus: searchKey.toLowerCase() });
    }

    if (sliderStatuses.includes(searchKey.toLowerCase())) {
        sliderCriteria.push({ slidertatus: searchKey.toLowerCase() });
    }


    try {
        const courses = await Course.find({ $or: courseCriteria });
        const teams = await Team.find({ $or: teamCriteria });
        const slides = await Slider.find({ $or: sliderCriteria });

        const finalCourses = courses.map((course) => ({
            ...course._doc, courseimage: `${req.protocol}://${req.get('host')}/uploads/${course.courseimage}`
        }));

        const finalTeams = teams.map((team) => ({
            ...team._doc, memberimage: `${req.protocol}://${req.get('host')}/teams/${team.memberimage}`
        }));

        const finalSlides = slides.map((slide) => ({
            ...slide._doc, sliderimage: `${req.protocol}://${req.get('host')}/sliders/${slide.sliderimage}`
        }));

        // Search videos
        const courseIds = courses.map(course => course._id);
        const videoCriteria = [
            { coursecategory: { $in: courseIds } },
            { videotopic: { $regex: new RegExp(searchKey, 'i') } },
        ];
        if (Videostatus.includes(searchKey.toLowerCase())) {
            videoCriteria.push({ videostatus: searchKey.toLowerCase() });
        }
        const videos = await Video.find({ $or: videoCriteria }).populate('coursecategory');

        const combinedResult = {
            courses: finalCourses,
            teams: finalTeams,
            sliders: finalSlides,
            videos: videos
        };

        res.status(200).json({ message: 'Search Results Found Successfully', data: combinedResult });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`the server is listening on ${port}`);
});