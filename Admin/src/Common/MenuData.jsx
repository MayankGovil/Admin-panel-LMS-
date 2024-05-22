import { faBook, faPeopleGroup, faSliders, faUsers, faVideo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const data = [
    {
        id:1,
        icon:<FontAwesomeIcon icon={faBook}/>,
        uid:"Courses",
        sub1:"Add Courses",
        sub2:"View Courses",
        link1:'/addcourse',
        link2:'/viewcourse',
    },
    {
        id:2,
        icon:<FontAwesomeIcon icon={faVideo}/>,
        uid:"Videos",
        sub1:"Add Videos",
        sub2:"View Videos",
        link1:'/addvideo',
        link2:'/viewvideo',

    },
    {
        id:3,
        icon:<FontAwesomeIcon icon={faSliders}/>,
        uid:"Slides",
        sub1:"Add Slides",
        sub2:"View Slides",
        link1:'/addslider',
        link2:'/viewslider',
    },
    {
        id:4,
        icon:<FontAwesomeIcon icon={faPeopleGroup}/>,
        uid:"Team",
        sub1:"Add Team",
        sub2:"View Team",
        link1:'/addteam',
        link2:'/viewteam',
    },
    {
        id:5,
        icon:<FontAwesomeIcon icon={faUsers}/>,
        uid:"User",
        sub1:"View User",
        sub2:"",
        link1:'/viewuser',
    },
]