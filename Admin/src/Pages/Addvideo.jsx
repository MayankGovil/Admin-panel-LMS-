import React, { useContext, useState, useEffect } from 'react'
import { mainContext } from '../Context';
import Header from '../Common/Header';
import Sidebar from '../Common/Sidebar';
import Footer from '../Common/Footer';
// import prev from '../img/generic-image-file-icon-hi.png'
import { useNavigate } from 'react-router';
import { useParams } from 'react-router';

function Addvideo() {


  let { changemenu } = useContext(mainContext);

  let nav = useNavigate();
  let { id } = useParams();
  console.log(id)
  const [videoData, setvideoData] = useState({});
  console.log(videoData);
  console.log(videoData.coursecategory);
  const [courseData, setcourseData] = useState([]);
  //console.log(courseData); //this will console the courses names whose status is Active



  const fetchVideobyid = async () => {
    let response = await fetch(`http://localhost:5000/getVideoby_id/${id}`);
    response = await response.json();
    setvideoData(response.data);
  }


  const fetchCoursedata = async () => {
    let courses = await fetch('http://localhost:5000/veiwcoursebystatus');

    courses = await courses.json();

    if (courses.data) {
      setcourseData(courses.data);

    } else {
      alert(courses.message);
    }
  };


  useEffect(() => {
    if (id) {
      fetchVideobyid();
    }
    fetchCoursedata();
  }, []);

  const formSumbitHandle = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    if (!id) {
      let response = await fetch('http://localhost:5000/AddVideo', {
        method: 'POST',
        body: data
      });
      response = await response.json();
      if (response.data) {
        nav('/viewvideo');
      }
      else {
        alert(response.message);
      }
    } else {
      let response = await fetch(`http://localhost:5000/UpdateVideo/${id}`, {
        method: 'PUT',
        body: data
      });
      console.log(response)
      nav('/viewvideo');
    }
  }

  return (
    <div>

      <Header />

      <div className='flex  bg-[#F5F7FF]'>
        <Sidebar />

        <div className={` ${changemenu === true ? 'w-[95%]' : 'w-[84%]'} relative px-[30px] pt-[20px] pb-[60px]  bg-[#F5F7FF]`}>

          <h1 className='text-[25px] font-[500] mb-[10px]'>
            Add Video
          </h1>
          <div className=''>
            <div className='bg-white w-[100%] mb-[50px] p-4 h-full rounded-[20px]'>
              <form action="" onSubmit={formSumbitHandle}>
                Course Category
                <select name="coursecategory" id="" className='w-full border my-3 border-gray-400 h-[50px]'>
                  {courseData.map((item, index) => (<option key={index + 1} value={item._id} className=''  >{item.coursename}</option>))}
                </select>
                Video Topic
                <input type="text" name='videotopic'value={videoData.videotopic} onChange={(e) => { setvideoData({ ...videoData, videotopic: e.target.value }) }}  className='border border-gray-400 w-full h-[50px] mb-3 mt-2 px-4 ' />
                Video Link
                <input type="text" value={videoData.videourl} onChange={(e) => { setvideoData({ ...videoData, videourl: e.target.value }) }} name='videourl' className='border border-gray-400 w-full h-[50px] mb-3 mt-2 px-4' />

                Video Status
                <div className='flex items-center mt-5  mb-8 gap-2'>
                  <label htmlFor="Activestatus" className='cursor-pointer'>
                    <input type="radio" name='videostatus' checked={videoData.videostatus === true || true} value={true} onChange={(e) => { setvideoData({ ...videoData, videostatus: e.target.value }) }} className='mx-2 w-[20px] h-[20px] text-[20px]' /> Active</label>

                  <label htmlFor="DeActivestatus" className='cursor-pointer'>
                    <input type="radio" name='videostatus' checked={videoData.videostatus === false} value={false} onChange={(e) => { setvideoData({ ...videoData, videostatus: e.target.value }) }} className='mx-2 w-[20px] h-[20px] text-[20px]' /> Deactive</label>
                </div>

                <input type="submit" className='bg-[#4B49AC] mb-8 mt-7 text-[18px] px-8 py-2 rounded-[10px] text-white' />
                <input type="reset" value="Cancel" className='bg-[#F8F9FA] ml-4  text-[18px] px-8 py-2 rounded-[10px] text-black' />
              </form>
            </div>
          </div>
          <Footer />
        </div>
      </div>

    </div>
  )
}

export default Addvideo