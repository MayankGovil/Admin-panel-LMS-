import React, { useContext, useState, useEffect } from 'react'
import { mainContext } from '../Context';
import Header from '../Common/Header';
import Sidebar from '../Common/Sidebar';
import Footer from '../Common/Footer';
import prev from '../img/generic-image-file-icon-hi.png'
import { useNavigate } from 'react-router'
import { useParams } from 'react-router'
function Addteam() {
  let { changemenu } = useContext(mainContext);
  let [imgprev, setimgprev] = useState('');
  let nav = useNavigate();
  let { id } = useParams();

  const [Team_memberData, setTeam_memberData] = useState({});
  //console.log(Team_memberData);

  const fetchTeam_memberbyid = async () => {
    let res = await fetch(`http://localhost:5000/Team_memberbyid/${id}`);
    res = await res.json();
    setTeam_memberData(res.data);
    setimgprev(res.data.memberimage);
  }

  useEffect(() => {
    if (id) {
      fetchTeam_memberbyid();
    }
    else {
      setTeam_memberData({});
      setimgprev('');
    }
  }, []);

  const formSumbitHandle = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    if (!id) {
      let response = await fetch('http://localhost:5000/addTeamMember', {
        method: 'POST',
        body: data
      });
      response = await response.json();
      if (response.data) {
        nav('/viewteam');
      }
      else {
        alert(response.message);
      }
    } else {
      let response = await fetch(`http://localhost:5000/UpdateTeamMember/${id}`, {
        method: 'PUT',
        body: data
      });
      console.log(response)
      nav('/viewteam');
    }
  }

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
  return (
    <div>

      <Header />

      <div className='flex  bg-[#F5F7FF]'>
        <Sidebar />

        <div className={` ${changemenu === true ? 'w-[95%]' : 'w-[84%]'} relative px-[30px] pt-[20px] pb-[60px]  bg-[#F5F7FF]`}>

          <h1 className='text-[25px] font-[500] mb-[10px]'>
            Team
          </h1>
          <div className=''>
            <div className='bg-white w-[100%] mb-[50px] p-4 h-full rounded-[20px] '>
              <form action="" onSubmit={formSumbitHandle}>
                Team Member Name
                <input type="text" name='membername' value={Team_memberData.membername}
                  onChange={(e) => { setTeam_memberData({ ...Team_memberData, membername: e.target.value }) }} className='border border-gray-400 px-4 w-full h-[50px] mb-3 mt-2 ' />
                Category
                <input type="text" name='membercategory' value={Team_memberData.membercategory} onChange={(e) => { setTeam_memberData({ ...Team_memberData, membercategory: e.target.value }) }} className='border border-gray-400 w-full h-[50px] mb-3 mt-2 px-4 ' />

                <input type="file" id='file-input' name='image' onChange={handlePrevimg} className='border hidden border-gray-400 w-full h-[50px] mb-3 ' />Member Image
                <div className='flex items-center gap-0 mt-[10px]'>
                  <div className='w-full flex items-center'>
                    <input type="text" name='image' readOnly placeholder='Upload File' className=' px-4 rounded-[10px_0px_0px_10px] border border-gray-400 w-[70%] h-[50px]' />
                    <label id="file-input-label" for="file-input" className='border block  bg-[#4B49AC] text-white text-center leading-[50px]  w-[10%] rounded-[0px_20px_20px_0px] h-[50px]  '>Upload</label>
                  </div>
                  <div className=''>
                    <img src={imgprev || prev} alt="" width={150} />
                  </div>
                </div>

                Team Member Status
                <div className='flex items-center mt-5  mb-8 gap-2'>
                  <input type="radio" name='memberstatus' checked={Team_memberData.memberstatus === true || true} value={true} onChange={(e) => { setTeam_memberData({ ...Team_memberData, memberstatus: e.target.value }) }} className='mx-2 w-[20px] h-[20px] text-[20px]' /> Active
                  <input type="radio" name='memberstatus' checked={Team_memberData.memberstatus === false} value={false} onChange={(e) => { setTeam_memberData({ ...Team_memberData, memberstatus: e.target.value }) }} className='mx-2 w-[20px] h-[20px] text-[20px]' /> Deactive
                </div>

                <input type="submit" className='bg-[#4B49AC] cursor-pointer mb-8 mt-7 text-[18px] px-8 py-2 rounded-[10px] text-white' />
                <input type="reset" value="Cancel" className='bg-[#F8F9FA] cursor-pointer ml-4  text-[18px] px-8 py-2 rounded-[10px] text-black' />
              </form>
            </div>
          </div>
          <Footer />
        </div>
      </div>

    </div>
  )
}

export default Addteam