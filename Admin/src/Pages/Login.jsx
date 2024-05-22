import React, { useState ,useEffect} from 'react'
import logo from '../img/logo (1).svg';
import { useNavigate } from 'react-router';
import Cookies from 'js-cookie';

function Login() {
  let nav = useNavigate();

  const [userdata, setUserdata] = useState({ username: '', password: '' });

  const checkLogin = ()=>{
    let userData = Cookies.get('user');
   
    if(userData){
      nav('/dashboard');
    }
  }

  useEffect(()=>{
    checkLogin();
  },[]);

  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userdata)
      });
     
      const fetchedUserData = await response.json();
      console.log(fetchedUserData)
      if (fetchedUserData.status) {
        Cookies.set('user', JSON.stringify(fetchedUserData));
        Cookies.set('token',fetchedUserData.auth);
        //console.log(fetchedUserData);
        nav("/dashboard")
      }


    }
    catch (error) {
      console.log(error.message);
      alert('Something went wrong');
    }

  };
  return (

    <div className='bg-[#F5F7FF] w-full h-[100vh] flex justify-center items-center'>
      <div className='w-[500px] bg-white px-[50px] py-[50px] '>
        <img src={logo} alt="" width={180} className='mb-5' />
        <h3 className='text-black text-[16px] font-[400]'>Sign in to continue.</h3>
        <form action="" onSubmit={loginHandler}>
          <input type="text" name='Username' onChange={(e) => { setUserdata({ ...userdata, username: e.target.value }) }} className=' mt-5 px-7 text-[16px] focus:outline-blue-400 w-full h-[50px] border border-1 border-[#c5c0c0]' placeholder='Username' />
          <input type="text" name='User_password' onChange={(e) => { setUserdata({ ...userdata, password: e.target.value }) }} className=' mt-6 mb-5 px-7 text-[16px] focus:outline-blue-400 w-full h-[50px] border border-1 border-[#c5c0c0]' placeholder='Password' />

          <button type="submit" className='w-full bg-[#4B49AC] text-center text-[30px] text-white py-3 rounded-[18px] font-[arial] font-[400]'>Submit</button>

          <div className='flex items-center mt-4 justify-between mb-4'>
            <div className='flex items-center text-[gray] font-sans'> <input type="checkbox" className='mr-3 w-[17px] h-[17px]  appearance-none outline outline-2 outline-blue-700' />Keep me signed in</div>
            <div className='flex items-center text-[black] font-sans'>
              Forgot password? </div>
          </div>
        </form>
      </div>
    </div>

  )
}

export default Login