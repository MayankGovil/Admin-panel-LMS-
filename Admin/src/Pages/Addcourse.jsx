import React, { useContext, useState, useEffect } from 'react'
import Header from '../Common/Header'
import Sidebar from '../Common/Sidebar'
//import DashboardItems from '../Common/DashboardItems'
import Footer from '../Common/Footer'
import { mainContext } from '../Context'
import prev from '../img/generic-image-file-icon-hi.png'
import { useNavigate } from 'react-router'
import { useParams } from 'react-router'
// import AdminForms from '../Common/AdminForms'

function Addcourse() {
  let { changemenu } = useContext(mainContext);
  let [imgprev, setimgprev] = useState('');
  let nav = useNavigate();
  let { id } = useParams();// we use use params instead of use location because usePrames is comes under react-router 

  const [courseData, setcourseData] = useState({});
  console.log(courseData);

  const fetchCoursebyid = async () => {
    let res = await fetch(`http://localhost:5000/coursebyid/${id}`);
    res = await res.json();
    setcourseData(res.data);
    setimgprev(res.data.courseimage);

  }
  useEffect(() => {
    if (id) {
      fetchCoursebyid();
    }
    else{
      setcourseData({});
      setimgprev('');
    }
  }, []);



  const handlePrevimg = (e) => {
    const reader = new FileReader();
    const file = e.target.files[0];
    if (file) {
      reader.readAsDataURL(file);
    }
    reader.onload = () => {
      console.log(reader)
      setimgprev(reader.result);
    };
  }


  const formSumbitHandle = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    if (!id) {
      let response = await fetch('http://localhost:5000/addcourse', {
        method: 'POST',
        body: data
      });
      response = await response.json();
      if (response.data) {
        nav('/viewcourse');
      }
      else {
        alert(response.message);
      }
    }
    else{
      let response = await fetch(`http://localhost:5000/UpdateCourse/${id}`, {
        method: 'PUT',
        body: data
      });
     console.log(response)
     nav('/viewcourse');
    }
  }


  return (
    <div>

      <Header />

      <div className='flex  bg-[#F5F7FF]'>
        <Sidebar />

        <div className={` ${changemenu === true ? 'w-[95%]' : 'w-[84%]'} relative px-[30px] pt-[20px] pb-[60px]  bg-[#F5F7FF]`}>

          <h1 className='text-[25px] font-[500] mb-[10px]'>
            Courses
          </h1>
          <div className=''>
            <div className='bg-white w-[100%] mb-[50px] p-4 h-full rounded-[20px]'>
              <form action="" onSubmit={formSumbitHandle}>
                Courses Name
                <input type="text" name='coursename' value={courseData.coursename}
                  onChange={(e) => { setcourseData({ ...courseData, coursename: e.target.value }) }} className='border px-4 border-gray-400 w-full h-[50px] mb-3 mt-2 ' />
                Courses Price
                <input type="text" name='courseprice' value={courseData.courseprice} onChange={(e) => { setcourseData({ ...courseData, courseprice: e.target.value }) }} className='border px-4 border-gray-400 w-full h-[50px] mb-3 mt-2 ' />
                Courses Duration
                <input type="text" name='courseduration' value={courseData.courseduration} onChange={(e) => { setcourseData({ ...courseData, courseduration: e.target.value }) }} className='border px-4 border-gray-400 w-full h-[50px] mb-3 mt-2' />
                Courses Description
                <textarea name="coursedecription" value={courseData.coursedecription} onChange={(e) => { setcourseData({ ...courseData, coursedecription: e.target.value }) }} className='border px-4 pt-3 border-gray-400 my-2 w-full h-[100px]' cols="30" rows="10"></textarea>
                <input type="file" id='file-input' name='image' onChange={handlePrevimg} className='border hidden border-gray-400 w-full h-[50px] mb-3 mt-2'/>Course Image
                <div className='flex items-center gap-0 mt-[10px]'>
                  <div className='w-full flex items-center'>
                    <input type="text" name='image' readOnly placeholder='Upload File' className=' px-4 rounded-[10px_0px_0px_10px] border border-gray-400 w-[70%] h-[50px]' />
                    <label id="file-input-label" for="file-input" className='border block  bg-[#4B49AC] text-white text-center leading-[50px] cursor-pointer w-[10%] rounded-[0px_20px_20px_0px] h-[50px]  '>Upload</label>
                  </div>
                  <div className=''>
                    <img src={imgprev || prev} alt="prev_img" width={150} />
                  </div>
                </div>
                Courses Status
                <div className='flex items-center mt-5  mb-8 gap-2'>
                  <input type="radio" name='coursestatus' checked={courseData.coursestatus === true||true} value={true} onChange={(e) => { setcourseData({ ...courseData, coursestatus: e.target.value }) }} className='mx-2 w-[20px] h-[20px] text-[20px] cursor-pointer' /> Active
                  <input type="radio" name='coursestatus' checked={courseData.coursestatus === false} value={false} onChange={(e) => { setcourseData({ ...courseData, coursestatus: e.target.value }) }} className='mx-2 w-[20px] h-[20px] text-[20px] cursor-pointer' /> Deactive
                </div>

                <input type="submit" className='bg-[#4B49AC] cursor-pointer mb-8 mt-7 text-[18px] px-8 py-2 rounded-[10px] text-white' />
                <input  type="reset" value="Cancel" className='bg-[#F8F9FA] ml-4 cursor-pointer text-[18px] px-8 py-2 rounded-[10px] text-black' />
              </form>
            </div>
          </div>
          <Footer className />
        </div>
      </div>

    </div>
  )
}

export default Addcourse