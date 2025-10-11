//src/navs/Menubar.tsx

import React, { useState,useEffect } from 'react'
import '../styles/Navs.css'
// import personicon from 
import edit from '../icons/edit.svg'
import balanceicon from '../icons/balance.svg'
import usersicon from '../icons/onlineuser.svg'
import Addicon from '../icons/addIcon.svg'
import manageIcon from "../icons/manageIcon.svg"
import { useRouter } from 'next/navigation'
// import { Logout } from '../auth/Logout'
// import { useLocation } from 'react-router-dom'
// import { useSelector,useDispatch } from 'react-redux'
// import { resetprofilebyid } from '../app/features/profile/comprofile'

export const Menubar = () => {
  const router = useRouter()
  // const dispatch = useDispatch()
  // const photo =  useSelector(state => state.comprofile.profilephoto)
  // const firstname =   useSelector(state=> state.profile.firstname)
  // const lastname =   useSelector(state=> state.profile.lastname)
  // const nickname =   useSelector(state=> state.profile.nickname)
  // const balance =   useSelector(state=> state.profile.balance)
  // const withdraw =   useSelector(state=> state.profile.witdrawable)
  // const creator =   useSelector(state=> state.profile.creator)
  // const creator_portfolio_id =   useSelector(state=> state.profile.creator_portfolio_id)
  // const postuserid = useSelector(state => state.register.userID)
  // const [profilepics,setprofilepics] = useState();
  // const [username,setusername] = useState(nickname);
  // const [Balance,setBalance] = useState('');



  let USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

//   useEffect(()=>{

//     if(photo){
//       setprofilepics(photo)
//     }
//     if(!nickname){
//       let namees = `${firstname} ${lastname}`
//       setusername(namees)
//     }

//     if(balance){
//       let currency = `${USDollar.format(balance)}`
//       setBalance(currency)
//     }else{
//       let currency = `${USDollar.format(0)}`
//       setBalance(currency)
//     }
//  })

//  const Isnotcreator = ()=>{
//   if(!creator) {
//     return true
//   }else{
//     return false
//   }
//  }

//  const creator_portfolio = ()=>{
//   if(creator) {
//     return true
//   }else{
//     return false
//   }
//  }

//  const location = useLocation().pathname
  return (
    <nav className='sm:block sm:h-svh sm:fixed z-10 sm:pb-10'>
      <div className='section'>
        <p className='text-yellow-600 text-center font-bold'>
          Profile
        </p>
        <div className='bg-slate-400 w-fit h-fit mx-auto rounded-full mt-2'>
        <img
        alt='perimg'
        src={require('../../public/icons/person.svg')}
        className='mx-auto object-contain w-28 h-28 rounded-full'
        >
        </img>
        </div>

        <p className='text-center text-slate-300'>{"John Doe"}</p>

        <button className='flex flex-row mx-auto'>
         <p className='text-center underline text-sm font-semibold text-yellow-600'>Edit Profile</p>
         <img
         alt='editicon'
         src={edit}
         >
         </img>
        </button>

        <button className='flex flex-row mx-auto'
        // onClick={(e)=>{
        //   if(location === `/profile/${postuserid}` ){
        //     return
        //   }
        //    dispatch(resetprofilebyid())
        //    router.push(`/profile/${postuserid}`)
        //  // console.log(location)
        // }}
        >
         <p className='text-center underline text-sm font-semibold text-yellow-600 mr-4'>View Profile</p>
        </button>


       {
        1 && // isNotCreator()
        <button className='flex flex-row mx-auto mt-2' onClick={(e)=>{
          router.push("/createcreator")
        }}>
         <p className='text-center text-sm font-semibold text-yellow-600'>Become a creator</p>
         <img className='w-5 h-5 object-cover ml-1'
         alt='editicon'
         src={Addicon}
         >
         </img>
        </button>


       }


        {
          true && // creator_portfolio()
          <button className='flex flex-row mx-auto mt-2' onClick={()=>{
            router.push(`/creatorbyid/random_id_123`)
          }}>
           <p className='text-center text-sm font-semibold text-yellow-600'>Creator portfolio</p>
           <img className='w-5 h-5 object-cover ml-1'
           alt='editicon'
           src={manageIcon}
           >
           </img>
          </button>
        }




      </div>

      <div className='section'>
        <p className='text-yellow-600 text-center font-bold'>
          Account
        </p>

        <div className='w-fit h-fit mx-auto flex flex-row mt-2'>
        <img
        alt='balanceicon'
        src={balanceicon}
        className='mx-auto object-contain w-5 h-5'
        >
        </img>

        <p className='text-center mx-auto text-xs font-semibold text-yellow-600'>Balance</p>
        </div>

        <p className='text-center text-green-500 text-xs font-bold'>{50}</p>


        <button className='flex flex-row mx-auto mb-2' onClick={(e)=>router.push("/goldstats")}>
         <p className='text-center underline text-xs font-semibold text-yellow-600 ml-2'>View Earnings</p>
        </button>

        <button className='flex flex-row mx-auto ' onClick={(e)=>router.push("/topup")}>
         <p className='text-center underline text-xs font-semibold text-yellow-600 ml-2'>Acc Topup</p>
         <img
         alt='editicon'
         src={edit}
         className='mx-auto w-5 h-5'
         >
         </img>
        </button>



      </div>

      <div>
        <div className='w-fit h-fit mx-auto flex flex-row mt-2'>
        <p className='text-center mx-auto font-semibold text-yellow-600 text-xs mr-2'><span className='text-green-600 text-sm font-extrabold'>&#8226; </span>Online Followers</p>
        <img
        alt='balanceicon'
        src={usersicon}
        className='mx-auto object-contain w-5 h-5'
        >
        </img>

        </div>



      </div>

      <div className='bottom-2 absolute ml-4'>
        <div className=' mx-auto flex flex-row mt-2'>
        {/* <Logout/> */}

        </div>

      </div>


    </nav>
  )
}
