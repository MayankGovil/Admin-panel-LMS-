// import { faCircle } from '@fortawesome/free-solid-svg-icons'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext } from 'react'
import Menuitems from './Menuitems'
import 'flowbite';
import { mainContext } from '../Context';
function Sidebar() {
  let {changemenu} = useContext(mainContext);
  return (
    <>
    <div className={`duration-[0.2s] ${changemenu===true ? 'w-[5%]':'w-[16%]'}  bg-white`}>
        <ul className={` py-4 ${changemenu===true ? 'px-0' : 'px-5'}`}>
                <Menuitems />
        </ul>
    </div>
    </>
  )
}

export default Sidebar