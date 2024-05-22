import { faAngleDown, faAngleRight, faArrowDownUpAcrossLine, faCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext, useEffect, useState } from 'react'
import { data } from './MenuData'
import { mainContext } from '../Context';
import { Link } from 'react-router-dom';

function Menuitems() {
  
  
  let {changemenu,menu,setMenu,mydata} = useContext(mainContext);

  useEffect(()=>{
    setMenu(menu)
  },[menu])

 
 
  

  
  return (
    <>  
    {
      changemenu==true ? 
      mydata.map((v,i)=>{
       
        return(
         

          <div key={i} className='w-full  mb-2'>
            <div  className={` group flex items-center justify-center relative hover:bg-[#4B49AC] hover:text-white   duration-[0.3s] py-3 px-0 text-center  `}>
            <h4 className='text-[20px] text-gray-600 group-hover:text-white '>{v.icon}</h4>

            
            <ul  className={`text-white group-hover:visible group-hover:opacity-[1] w-[220px] invisible opacity-0 z-[99] text-[14px] min-h-[190px] ease-in-out px-[50px] duration-[0.8s] absolute left-[100%] top-0 bg-[#4B49AC]`}>
              
            <h4 className='text-[15px] text-left pb-3 pt-2 text-white'>{v.uid}</h4>

              
            <Link to={v.link1}><li className='flex items-center mb-2 pl-4'><FontAwesomeIcon icon={faCircle} className='text-[8px] pr-2'/>{v.sub1}</li></Link>
            <Link to={v.link2}><li className='flex items-center pl-4 '><FontAwesomeIcon icon={v.sub2=="" ? " " : faCircle}  className='text-[8px] pr-3'/>{v.sub2=="" ? " " : v.sub2 }</li></Link>
            </ul>
            </div>
            
            </div>
            
            
          
          )
        })
        :
        mydata.map((v,i)=>{
       
          return(
           
  
            <div key={i} className='w-full  mb-2'>
              <div onClick={()=>setMenu(v.id==menu? 0 : v.id)} className={` flex items-center justify-between hover:bg-[#4B49AC] hover:text-white   duration-[0.3s] py-3 px-4  ${v.id==menu ? 'rounded-[10px_10px_0px_0px] bg-[#4B49AC] text-white':'text-gray-600 rounded-[10px]'}`}>
              <h4>{v.icon}&nbsp;&nbsp;{v.uid} </h4>
              
              <FontAwesomeIcon icon={v.id==menu ? faAngleDown : faAngleRight}/>
              </div>
              <ul  className={`text-white text-[14px] ease-in-out px-[50px] duration-[0.8s] ${v.id==menu ? ' py-3 h-[120px] opacity-[1] visible  bg-[#4B49AC]':'opacity-0 h-0 invisible'}`}>
              <Link to={v.link1}> <li className='flex items-center mb-2'><FontAwesomeIcon icon={faCircle} className='text-[8px] pr-3'/>{v.sub1}</li></Link>
              <Link to={v.link2}><li className='flex items-center '><FontAwesomeIcon icon={v.sub2=="" ? " " : faCircle}  className='text-[8px] pr-3'/>{v.sub2=="" ? " " : v.sub2 }</li></Link>
              </ul>
              </div>
              
              
            
            )
          })
      }
      
      
      </>
      )
    }
    
    export default Menuitems