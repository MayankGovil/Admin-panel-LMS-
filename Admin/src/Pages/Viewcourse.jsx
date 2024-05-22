import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { mainContext } from '../Context';
import Header from '../Common/Header';
import Sidebar from '../Common/Sidebar';
import Footer from '../Common/Footer';
import Cookies from 'js-cookie';

function Viewcourse() {
  let { changemenu } = useContext(mainContext);
  let nav = useNavigate();

  const [coursesdata, setCoursesdata] = useState([]);

  const [modalContent, setModalContent] = useState(null);

  const tokenAuth = Cookies.get('token');
  console.log(tokenAuth);


  const fetchCoursedata = async () => {
    let Courses = await fetch('http://localhost:5000/veiwcourses', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenAuth}`
      }
    });
    Courses = await Courses.json();
    if (Courses.data) {
      setCoursesdata(Courses.data);
    } else {
      alert(Courses.message);
    }
  };

  useEffect(() => {
    fetchCoursedata();
  }, []);



  const handleStatus = async (e) => {
    setsearchValue('');
    const id = e.target.value;
    const status = e.target.textContent;

    const UpdatedStatus = status !== 'Active';

    try {
      const res = await fetch(`http://localhost:5000/updatecourse_status/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: UpdatedStatus })
      });

      const resData = await res.json();
      console.log(resData);
      fetchCoursedata();
    } catch (err) {
      console.log(err);
      alert('Something went wrong');
    }
  };

  const handleDelete = async (e) => {
    const id = e.target.value;
    const name = e.target.name;
    if (window.confirm(`Are you want to delete course with name :- ${name}`)) {
      try {
        let response = await fetch(`http://localhost:5000/DeleteCourse/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _id: id })
        });
        response = await response.json();
        console.log(response);
        fetchCoursedata();
      } catch (err) {
        console.log(err);
        alert('Something went wrong');
      }
    }
  };

  const handleUpdate = (e) => {
    const id = e.target.value;
    nav(`/addcourse/${id}`);
  };


  const [deleteArray, setDeleteArray] = useState([]);
  console.log(`These are the id's are selected: [${deleteArray}]`);


  const [isAllChecked, setisAllChecked] = useState(false);
  // console.log(isAllChecked);


  const handleCheckboxChange = (e) => {
    const courseId = e.target.value;
    const isChecked = e.target.checked;

    if (isChecked) {
      setDeleteArray([...deleteArray, courseId]);
    } else {
      setDeleteArray(deleteArray.filter((id) => id !== courseId));
    }
  };

  const handleAllCheck = (e) => {
    const idAllCheck = e.target.checked;
    console.log(idAllCheck);

    setisAllChecked(idAllCheck);
    let newDataArray = [];
    if (idAllCheck) {
      coursesdata.forEach((item) => {
        newDataArray.push(item._id);
      });
      setDeleteArray(newDataArray);
    }
    else {
      setDeleteArray([]);
    }
  };


 
  const DeleteMultipleCourses = async () => {
    //Perform deletion logic with the selected IDs stored in deletedArray
    if (deleteArray.length > 0 && window.confirm('Are you sure you want to delete Slected Courses'+deleteArray)) {
      let response = await fetch('http://localhost:5000/multiple_coursesDelete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: deleteArray }),
      });
      response = await response.json();
      if (response.data) {
        fetchCoursedata();
      } else {
        alert(response.message);
      }
    }
    else {
      setDeleteArray([]);
      alert('Please select the courses');
    }
  };

  
  const [searchValue,setsearchValue] = useState('');

  const handleSearch = async(e)=>{
    const sVal = e.target.value;
    setsearchValue(sVal);
    if (!sVal){
      fetchCoursedata();
    }else{
      console.log(searchValue);
      let Response = await fetch(`http://localhost:5000/searchcourses/${sVal}`)
      Response= await Response.json();
      if (Response.data){
        setCoursesdata(Response.data);
      }
    }
  };

  const handleDescriptionClick = (course) => {
    setModalContent(course);
  };

  const handleCloseModal = () => {
    setModalContent(null);
  };


  return (
    <div>
      <Header />
      <div className='flex  bg-[#F5F7FF]'>
        <Sidebar />
        <div className={` ${changemenu === true ? 'w-[95%]' : 'w-[84%]'} relative px-[30px] py-[50px] bg-[#F5F7FF]`}>
          <h1 className='text-[25px] flex font-[500] mb-[10px]'>
            <span className='mt-3'>Welcome To View Course Table</span>
            <form class="max-w-md  mb-[10px] w-3/4 mx-auto">
            <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
            <div class="relative">
              <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input type="search" value={searchValue} onChange={handleSearch} id="default-search" class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Mockups, Logos..." required />
              {/* <button type="submit" class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button> */}
            </div>
          </form>
          </h1>

          

          <div className=''>
            <div className='bg-white w-[100%] mb-[50px] p-4 h-full rounded-[20px]'>
              <table>
                <thead>
                  <tr>
                    <th>S.no</th>
                    <th>Course Name</th>
                    <th><button onClick={DeleteMultipleCourses} className='bg-red-400 text-white px-3 py-1'>Delete</button>
                      <input type="checkbox" checked={isAllChecked} onChange={handleAllCheck} name='Select all checkbox' className='h-[20px] my-2 cursor-pointer w-5' />
                    </th>
                    <th>Price(&#8377;)</th>
                    <th>Duration</th>
                    <th>Description</th>
                    <th>Image</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(coursesdata.length >= 1) ? coursesdata.map((course, index = 0) => (
                    <tr key={course._id}>
                      <td>{index + 1}</td>
                      <td>{course.coursename}</td>
                      <td><input type="checkbox" checked={isAllChecked || deleteArray.includes(course._id)} onChange={handleCheckboxChange} value={course._id} className='h-[20px] ml-6 cursor-pointer w-5' name="" id="" /></td>
                      <td>&#8377;{course.courseprice}</td>
                      <td>{course.courseduration}</td>
                      <td>
                        <span
                          onClick={() => handleDescriptionClick(course)}
                          style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                        >
                          {course.coursedecription.split(' ').slice(0, 3).join(' ')}...
                        </span>
                      </td>
                      <td>
                        <img className='w-[100px] h-14 cursor-pointer' src={course.courseimage} alt="courseimage" onClick={() => handleDescriptionClick(course)} />
                      </td>

                      <td><button onClick={handleStatus} value={course._id} className={`py-2 w-20 px-3 text-white rounded ${(course.coursestatus) ? 'bg-green-400' : 'bg-red-400'}`}>{(course.coursestatus) ? 'Active' : 'Inactive'}</button></td>
                      <td className='text-center py-10 mt-5 flex border-0'>
                        <button onClick={handleUpdate} value={course._id} className='bg-green-500 text-white px-5 mr-2 py-1'>Edit</button>
                        <button value={course._id} name={course.coursename} onClick={handleDelete} className='bg-red-400 text-white px-5 py-1'>Delete</button>
                      </td>
                    </tr>
                  )) : <td className='text-center' colSpan={9} >No data Found In API</td>}
                </tbody>
              </table>
            </div>
          </div>
          <Footer />
        </div>
        {/*Main content end here  */}
        {modalContent && (
          <div className={`mainOverlay ${modalContent ? 'activemainOverlay' : ''}`}>
            <div className={`popup ${modalContent ? 'activepopup' : ''}`}>
              <img src={modalContent.courseimage} alt="courseimage" />
              <h2 className='ml-[10px] text-[16px] font-semibold space-x-4'><span className='text-[20px] mr-2 font-extrabold underline underline-offset-2 decoration-3'>Course Name:- </span>{modalContent.coursename}</h2>
              <p className='ml-[10px] text-[16px] font-semibold space-x-4'>
                <span className='text-[20px] mr-2 font-extrabold underline underline-offset-2 decoration-3'>Description:- </span>{modalContent.coursedecription}</p>

              <p className='ml-[10px] text-[16px] font-semibold space-x-4'><span className='text-[20px] mr-2 font-extrabold underline underline-offset-2 decoration-3'>Price:- </span>&#8377;{modalContent.courseprice}</p>
              <p className='ml-[10px] text-[16px] font-semibold space-x-4'><span className='text-[20px] mr-2 font-extrabold underline underline-offset-2 decoration-3'>Duration:- </span>{modalContent.courseduration}</p>
              <span className='close' onClick={handleCloseModal}>&times;</span>
            </div>
          </div>

        )}
      </div>
    </div>
  )
};

export default Viewcourse;
