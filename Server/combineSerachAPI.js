const express = require('express');
require('./config');
const Course = require('./modals/AddCourse');
const Video = require('./modals/AddVideo');
const Team = require('./modals/AddTeam');
const Slider = require('./modals/AddSlider');
const path = require('path');

const app = express();

app.use(express.json());
const port = 5000;

const cors = require('cors');
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/teams', express.static(path.join(__dirname, 'teams')));

app.use('/sliders', express.static(path.join(__dirname, 'sliders')));



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
        const Videostatus = ['true', 'false'];
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

app.get('/searchVideosByCategory/:category', async (req, res) => {
    let category = req.params.category;

    try {
        const course = await Course.find({ coursename: { $regex: new RegExp(category, "i") } });
        if (!course) {
            return res.status(404).json({ message: 'Course category not found' });
        }
        const videos = await Video.find({ coursecategory: course._id, videostatus: 'true' }).populate('coursecategory');
        res.status(200).json({ message: 'Videos found successfully', data: videos });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.listen(port, () => {
    console.log(`the server is listening on ${port}`);
});
