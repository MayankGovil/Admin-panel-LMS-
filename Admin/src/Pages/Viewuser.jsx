import React, { useContext } from 'react'
import { mainContext } from '../Context';
import Header from '../Common/Header';
import Sidebar from '../Common/Sidebar';
import Footer from '../Common/Footer';

function Viewuser() {
  let {changemenu} = useContext(mainContext);
  return (
    <div>

<Header/>
    
    <div className='flex  bg-[#F5F7FF]'>
      <Sidebar/>
      
      <div className={` ${changemenu===true ? 'w-[95%]':'w-[84%]'} relative px-[30px] py-[50px] h-[92vh] bg-[#F5F7FF]`}>

        <h1 className='text-[25px] font-[500] mb-[10px]'>
        Welcome To Admin Panel
        </h1>
        <div className=''>
        <div className='bg-white w-[100%] mb-[50px] p-4 h-full rounded-[20px]'>
          <table >
            <tr>
              <th>S.no</th>
              <th>Name</th>
              <th>Email</th>
              <th>Password</th>
              <th>Action</th>
            </tr>
            <tr>
              <td>1</td>
              <td>React</td>
              <td>20000</td>
              <td>1 month</td>
              <td className='text-center flex border-0'>
              <button className='bg-green-500 text-white px-5 mr-5 py-1'>Edit</button>
              <button className='bg-red-400 text-white px-5 py-1'>Delete</button>
              </td>
            </tr>
          </table>
        </div>
        </div>
      <Footer/>
      </div>
    </div>

    </div>
  )
}

export default Viewuser