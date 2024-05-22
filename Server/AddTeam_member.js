// Import necessary modules
const express = require('express');
require('./config');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Team = require('./modals/AddTeam');
// Create an Express app
const app = express();

app.use(express.json());
const port = 5000;

const cors = require('cors');
app.use(cors());

// Set up Multer storage for handling file uploads
const store_teamimage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Define the destination directory for storing uploaded images
        cb(null, 'teams');
    }, 
    filename: function (req, file, cb) {
        // Generate a unique filename for the uploaded image
        cb(null, Date.now() + file.originalname);
    }
});

// Set up Multer middleware to handle single image uploads
const uploadTeam = multer({ storage: store_teamimage }).single('image');

// Serve uploaded images statically for viewing
app.use('/teams', express.static(path.join(__dirname, 'teams')));

// Route to add a new team member
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

// View Only those Team members whose status is Active('True')
app.get('/viewTeamMembersbystatus', async (request, response) => {
    try {
      // Retrieve active team members from the database
      const activeTeams = await Team.find({ memberstatus: true });
  
      // Check if any active team members found
      if (!activeTeams.length) {
        return response.status(404).json({ message: 'No Active Team Members Found' });
      }
  
      // Modify each team member's image path to include the host URL
      const finalTeams = activeTeams.map((team) => ({
        ...team._doc,
        memberimage: `${request.protocol}://${request.get('host')}/teams/${team.memberimage}`
      }));
  
      // Respond with success message and data
      response.status(200).json({ message: 'Active Team Members Found Successfully', data: finalTeams });
    } catch (err) {
      console.log(err);
      response.status(500).json({ message: 'Internal Server Error' });
    }
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

// Start the server
app.listen(port, () => {
    console.log(`the server is listening on ${port}`);
});
