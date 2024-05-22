import React, { useContext, useState, useEffect } from 'react'
import { mainContext } from '../Context';
import Header from '../Common/Header';
import Sidebar from '../Common/Sidebar';
import Footer from '../Common/Footer';
import prev from '../img/generic-image-file-icon-hi.png';
import { useNavigate } from 'react-router'
import { useParams } from 'react-router'

function Addslider() {
  let { changemenu } = useContext(mainContext);
  let [imgprev, setimgprev] = useState('');

  let nav = useNavigate();
  let { id } = useParams();

  const [sliderData, setsliderData] = useState({});
  console.log(sliderData);

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

  const fetchSliderbyid = async()=>{
    let res = await fetch(`http://localhost:5000/getSlide_byid/${id}`);
    res = await res.json();
    setsliderData(res.data);
    setimgprev(res.data.sliderimage);

  }

  useEffect(() => {
    if (id) {
      fetchSliderbyid();
    }
    else{
      setsliderData({});
      setimgprev('');
    }
  }, []);


  const formSumbitHandle = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    if (!id) {
      let response = await fetch('http://localhost:5000/addslider', {
        method: 'POST',
        body: data
      });

      response = await response.json();
      if (response.data) {
        nav('/viewslider');
      }
      else {
        alert(response.message);
      }
    }
    else{
      let response = await fetch(`http://localhost:5000/UpdateSlider/${id}`, {
        method: 'PUT',
        body: data
      });
     console.log(response)
     nav('/viewslider');
    }
  }


  return (
    <div>

      <Header />

      <div className='flex  bg-[#F5F7FF]'>
        <Sidebar />

        <div className={` ${changemenu === true ? 'w-[95%]' : 'w-[84%]'} relative px-[30px] pt-[20px] pb-[60px]  bg-[#F5F7FF]`}>

          <h1 className='text-[25px] font-[500] mb-[10px]'>
            Slider
          </h1>
          <div className=''>
            <div className='bg-white w-[100%] mb-[50px] p-4 h-full rounded-[20px]'>
              <form action=""  onSubmit={formSumbitHandle}>
                Slider Heading
                <input type="text" name='slidername' value={sliderData.slidername}
                  onChange={(e) => { setsliderData({ ...sliderData, slidername: e.target.value }) }} className='border border-gray-400 px-4 w-full h-[50px] mb-3 mt-2 ' />
                Slider Sub-Heading
                <input type="text" name='slidersubheading' value={sliderData.slidersubheading}  onChange={(e) => { setsliderData({ ...sliderData, slidersubheading: e.target.value }) }}  className='border border-gray-400 w-full h-[50px] mb-3 mt-2 px-4 ' />
                Slider Image
                <input type="file" id='file-input' name='image' onChange={handlePrevimg} className='border hidden border-gray-400 w-full h-[50px] mb-3 mt-2 ' />
                <div className='flex items-center gap-0 mt-[80px]'>
                  <div className='w-full flex items-center'>
                    <input type="text" name='image' placeholder='Upload File' className=' px-4 rounded-[10px_0px_0px_10px] border border-gray-400 w-[70%] h-[50px]' readOnly />
                    <label id="file-input-label" for="file-input" className='border block  bg-[#4B49AC] text-white text-center leading-[50px]  w-[10%] rounded-[0px_20px_20px_0px] h-[50px]  '>Upload</label>
                  </div>
                  <div className=''>
                    <img src={imgprev || prev} alt="" width={150} />
                  </div>
                </div>
                Slider Description
                <textarea name="sliderdecription" value={sliderData.sliderdecription}
                  onChange={(e) => { setsliderData({ ...sliderData, sliderdecription: e.target.value }) }} className='border px-4 pt-3 border-gray-400 my-2 w-full h-[100px]' cols="30" rows="10"></textarea>
                Slider Status
                <div className='flex items-center mt-5  mb-8 gap-2'>
                  <input type="radio" name='slidertatus' checked={sliderData.slidertatus === true || true} value={true} onChange={(e) => { setsliderData({ ...sliderData, slidertatus: e.target.value }) }} className='mx-2 w-[20px] h-[20px] text-[20px]' /> Active
                  <input type="radio" name='slidertatus' checked={sliderData.slidertatus === false} value={false} onChange={(e) => { setsliderData({ ...sliderData, slidertatus: e.target.value }) }} className='mx-2 w-[20px] h-[20px] text-[20px]' /> Deactive
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

export default Addslider