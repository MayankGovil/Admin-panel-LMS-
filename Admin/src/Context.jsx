import React, { createContext, useEffect, useState } from 'react'
import { data } from './Common/MenuData';
let mainContext = createContext();
function Context(props) {

    let mydata = data;
  let [changemenu , setchangeMenu] = useState(false)
  let [menu,setMenu] = useState(mydata[0].id)
  useEffect(()=>{
    setMenu(0)
  },[])



  return (
    <mainContext.Provider value={{changemenu,setchangeMenu,menu,setMenu,mydata}}>
        {props.children}
    </mainContext.Provider>
  )
}

export default Context

export {mainContext};