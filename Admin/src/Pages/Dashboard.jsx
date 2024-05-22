import React, { useContext, useState } from 'react';
import Header from '../Common/Header';
import Sidebar from '../Common/Sidebar';
import { mainContext } from '../Context';
import DashboardItems from '../Common/DashboardItems';
import Footer from '../Common/Footer';

function Dashboard() {
  const { changemenu } = useContext(mainContext);

  const [searchValue, setSearchValue] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  

  const handleSearch = async (e) => {
    const sVal = e.target.value;
    setSearchValue(sVal);
    if (!sVal) {
      setSearchValue('');
    } else {
      try {
        let response = await fetch(`http://localhost:5000/searchAll/${sVal}`);
         response = await response.json();
        if (response.data) {
          setSearchResult(response.data);
        }else{
          alert(response.message);
        }
      } catch (error) {
       console.log(error);
       alert('Something went wrong!');
      }
    }
  };

  const handleDescriptionClick = (result) => {
    console.log(result);
  };

  

  return (
    <div>
      <Header />
      <div className='flex bg-[#F5F7FF]'>
        <Sidebar />
        <div className={` ${changemenu === true ? 'w-[95%]' : 'w-[84%]'} relative px-[30px] py-[50px] h-[92vh] bg-[#F5F7FF]`}>
          <h1 className='text-[25px] flex font-[500] mb-[30px]'>
            <span className='mt-3'>Welcome To Admin Panel</span>
            <form className="max-w-md mb-[10px] w-3/4 mx-auto">
              <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                  </svg>
                </div>
                <input type="search" value={searchValue} onChange={handleSearch} id="default-search" className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Mockups, Logos..." required />
                <button type="button" onClick={() => handleDescriptionClick(searchResult)} className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
              </div>
            </form>
          </h1>
          <div className='grid grid-cols-4 gap-5'>
            <DashboardItems />
          </div>
          <Footer />
        </div>
        
      </div>
    </div>
  );
}

export default Dashboard;

