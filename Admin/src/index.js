import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import Context from './Context';
import Addcourse from './Pages/Addcourse';
import Addslider from './Pages/Addslider';
import Addvideo from './Pages/Addvideo';
import Addteam from './Pages/Addteam';
import Viewuser from './Pages/Viewuser';
import Viewcourse from './Pages/Viewcourse';
import Viewslider from './Pages/Viewslider';
import Viewvideo from './Pages/Viewvideo';
import Viewteam from './Pages/Viewteam';

const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createBrowserRouter([
  {
    path:"/",
    element:<Login/>
  },
  {
    path:"dashboard",
    element:<Dashboard/>
  },
  {
    path:"addcourse/:id?",
    element:<Addcourse/>
  },
  {
    path:"addslider/:id?",
    element:<Addslider/>
  },
  {
    path:"addvideo/:id?",
    element:<Addvideo/>
  },
  {
    path:"addteam/:id?",
    element:<Addteam/>
  },
  {
    path:"viewuser",
    element:<Viewuser/>
  },
  {
    path:"viewcourse",
    element:<Viewcourse/>
  },
  {
    path:"viewslider",
    element:<Viewslider/>
  },
  {
    path:"viewvideo",
    element:<Viewvideo/>
  },
  {
    path:"viewteam",
    element:<Viewteam/>
  },


])
root.render(
   <Context>
  <RouterProvider router={router}/>

   </Context>

  // <React.StrictMode>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
