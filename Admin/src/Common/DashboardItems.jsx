import React from 'react'
import { dashboardData } from './DashboardData'

function DashboardItems() {
  let ddata = dashboardData;
  return (
    <>
      {
        ddata.map(v => {
          console.log(v.color)
          return (
            <div className={`w-full px-[15px] py-[18px] rounded-[20px] text-white `} style={{ background: v.color }}>
              <h3 className=''>{v.heading}</h3>
              <h1 className='text-[35px]'>{v.count}</h1>
              <p>{v.para}</p>
            </div>
          )
        })
      }

    </>
  )
}

export default DashboardItems