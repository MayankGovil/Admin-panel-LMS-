import React, { useContext, useEffect, useState } from 'react'
import { mainContext } from '../Context';
import Header from '../Common/Header';
import Sidebar from '../Common/Sidebar';
import Footer from '../Common/Footer';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router';

function Viewvideo() {
  let { changemenu } = useContext(mainContext);
  const [videoData, setvideoData] = useState([]);
  let nav = useNavigate();

  const fetchVideo = async () => {
    let Video = await fetch(`http://localhost:5000/viewVideos`);
    Video = await Video.json();
    if (Video.data) {
      setvideoData(Video.data);
    } else {
      alert(Video.message)
    }
  };

  useEffect(() => {
    fetchVideo();
    fetchCoursedata();
  }, []);


  const handleStatus = async (e) => {
    const id = e.target.value;
    const status = e.target.textContent;

    const UpdatedStatus = status !== 'Active';

    try {
      const res = await fetch(`http://localhost:5000/updatevideo_status/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: UpdatedStatus })
      });

      const resData = await res.json();
      console.log(resData);
      fetchVideo();
    } catch (err) {
      console.log(err);
      alert('Something went wrong');
    }
  };


  const handleUpdate = (e) => {
    const id = e.target.value;
    nav(`/addvideo/${id}`);
  };


  const handleDelete = async (e) => {
    const id = e.target.value;
    const name = e.target.name;
    window.confirm(`Are you want to delete course with name & id:- ${name}`);
    try {
      let response = await fetch(`http://localhost:5000/DeleteVideo/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id })
      });
      response = await response.json();
      console.log(response.message);
      fetchVideo();
    } catch (err) {
      console.log(err);
      alert('Something went wrong');
    }
  };

  const [deleteArray, setDeleteArray] = useState([]);
  // console.log(`These are the id's are selected: [${deleteArray}]`);


  const [isAllChecked, setisAllChecked] = useState(false);
  // console.log(isAllChecked);


  const handleCheckboxChange = (e) => {
    const videoId = e.target.value;
    const isChecked = e.target.checked;

    if (isChecked) {
      setDeleteArray([...deleteArray, videoId]);
    } else {
      setDeleteArray(deleteArray.filter((id) => id !== videoId));
    }
  };

  const handleAllCheck = (e) => {
    const idAllCheck = e.target.checked;
    // console.log(idAllCheck);

    setisAllChecked(idAllCheck);
    let newDataArray = [];
    if (idAllCheck) {
      videoData.forEach((item) => {
        newDataArray.push(item._id);
      });
      setDeleteArray(newDataArray);
    }
    else {
      setDeleteArray([]);
    }
  };


  const DeleteMultipleVideo = async () => {
    if (deleteArray.length > 0 && window.confirm('Are you sure you want to delete Slected Courses')) {
      let response = await fetch('http://localhost:5000/multiple_videosDelete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: deleteArray }),
      });
      response = await response.json();
      if (response.data) {
        fetchVideo();
      } else {
        alert(response.message);
      }
    }
    else {
      alert('Please select the courses');
      setDeleteArray([]);
    }
  };


  const [searchValue, setsearchValue] = useState('');

  const handleSearch = async (e) => {
    const sVal = e.target.value;
    setsearchValue(sVal);
    if (!sVal) {
      fetchVideo();
    } else {
      console.log(searchValue);
      let Response = await fetch(`http://localhost:5000/searchVideos/${sVal}`)
      Response = await Response.json();
      if (Response.data) {
        setvideoData(Response.data);
      }
    }
  };

  const [courseData, setcourseData] = useState([]);
  // console.log(courseData);
  const fetchCoursedata = async () => {
    let courses = await fetch('http://localhost:5000/veiwcoursebystatus');

    courses = await courses.json();

    if (courses.data) {
      setcourseData(courses.data);

    } else {
      alert(courses.message);
    }
  };

  const [categoryValue,setcategoryValue] = useState('');
  const SearchVideosByCategory = async(e)=>{
    const searchVal = e.target.value;
    setcategoryValue(searchVal);
    if (!searchVal){
      fetchVideo();
    }else{
      console.log("The Selected Course Category ID:- "+categoryValue);
     let Response = await fetch(`http://localhost:5000/searchVideosByCategory/${searchVal}`)
      Response = await Response.json();
      if (Response.data) {
        // console.log(Response.data);// this wll console array which having same course category videos by using the category
        setvideoData(Response.data);
      }
    }
  };

  return (
    <div>

      <Header />

      <div className='flex  bg-[#F5F7FF]'>
        <Sidebar />

        <div className={` ${changemenu === true ? 'w-[95%]' : 'w-[84%]'} relative px-[30px] py-[50px]  bg-[#F5F7FF]`}>

          <h1 className='text-[25px] flex font-[500] mb-[10px]'>
            <span className='mt-3'>Welcome To View Video's Table</span>
            <form class="max-w-md mb-[10px] w-3/4 mx-auto">
              <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
              <div class="relative">
                <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                  </svg>
                </div>
                <input type="search" value={searchValue} onChange={handleSearch} id="default-search" class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Mockups, Logos..." required />
              </div>
            </form>
          </h1>
          <div className="category-buttons overflow-x-auto whitespace-nowrap pb-2 max-w-full">
          <button type="button" name="View All Videos" onClick={fetchVideo} className='rounded-lg text-dark bg-white text-gray-900 px-4 py-2 mr-4 mb-4 border-blue-600'>All Courses Video</button>
            {courseData.map((item) => (
              <button type="button" name={item.coursename} value={item._id} onClick={SearchVideosByCategory} className='rounded-lg border-blue-600 bg-white text-gray-900 px-4 py-2 mr-4 mb-4'>
                {item.coursename}
              </button>
            ))}
          </div>
          <div className=''>
            <div className='bg-white w-[100%] mb-[50px] p-4 h-full rounded-[20px]'>
              <table >
                <thead>
                  <tr>
                    <th>S.no</th>
                    <th>Course Category</th>
                    <th><button onClick={DeleteMultipleVideo} className='bg-red-400 text-white px-3 py-1'>Delete</button>
                      <input type="checkbox" checked={isAllChecked} onChange={handleAllCheck} name='Select all video' className='h-[20px] my-2 cursor-pointer w-5' />
                    </th>
                    <th>Video Topic</th>
                    <th>Video Link</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>{(videoData.length >= 1) ? videoData.map((video, index = 0) => (
                  <tr key={video._id}>
                    <td>{index + 1}</td>
                    <td>{video.coursecategory.coursename}</td>

                    <td><input type="checkbox" checked={isAllChecked || deleteArray.includes(video._id)} onChange={handleCheckboxChange} value={video._id} className='h-[20px] ml-6 cursor-pointer w-5' name="" id="" /></td>
                    <td>{video.videotopic}</td>
                    <td><Link to={`${video.videourl}`} target="_blank" rel="noopener noreferrer"><button className='bg-[#4B49AC] text-white cursor-pointer text-[16px] px-5 py-1 rounded-[10px]'>Open Video</button>
                    </Link></td>

                    <td><button onClick={handleStatus} value={video._id} className={`py-2 w-20 px-3 text-white rounded ${(video.videostatus) ? 'bg-green-400' : 'bg-red-400'}`}>{(video.videostatus) ? 'Active' : 'Inactive'}</button></td>
                    <td className='text-center mt-5 flex border-0'>
                      <button onClick={handleUpdate} value={video._id} className='bg-green-500 text-white px-5 mr-5 py-1'>Edit</button>
                      <button className='bg-red-400 text-white px-5 py-1' value={video._id} name={video.videotopic} onClick={handleDelete} >Delete</button>
                    </td>
                  </tr>
                ))
                  : <td className='text-center' colSpan={7} >No data Found In API</td>}</tbody>

              </table>
            </div>
          </div>
          <Footer />
        </div>
      </div>

    </div>
  )
}

export default Viewvideo