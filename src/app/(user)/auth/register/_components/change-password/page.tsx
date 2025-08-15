import React from 'react'
// import { useState,useEffect } from 'react'
// import { toast,ToastContainer } from 'react-toastify'
// import {ChangePass,error,changepasswordback} from '../app/features/register/registerSlice'
// import { useDispatch, useSelector } from 'react-redux'


export const ChangePassword = () => {
    // const toastId = React.useRef(null);
    // const {userID} = useParams()
    // const [password,setpassword] = useState('')
    // const [compassword,setcompassword] = useState('')
    // const navigate = useNavigate();
    // const dispatch = useDispatch()
    // const errs = useSelector(error)
    // const stats = useSelector(state=> state.register.chagepassword)

    // const alert = (message,type,close)=>{    
    //   toastId.current = toast(`${message}`,{type :`${type}`,autoClose:close}); 
    // }
  
    // const dismissalert = ()=>{
    //   toast.dismiss(toastId.current)
    // }
    // useEffect(()=>{
    //     if(stats === "succeeded"){
    //         dismissalert()
    //       toast.success("Password Changed Successfully",{autoClose:2000})
    //       navigate('/')
    //     }

    //     if(stats === "failed"){
    //         dismissalert()
    //         toast.error(`${errs}`,'error',{autoClose:2000})
    //         dispatch(changepasswordback('idle'))
            
    //     }

    // },[stats])


//    export const checkInput = async ()=>{
    //     if(!password){
    //       toast.error("Enter New Password",{autoClose:2000})
    //       return
    //     }
    //     if(!compassword){
    //         toast.error("Enter  Your New Preferd Password",{autoClose:2000})
    //         return
    //       }
    //       if(password !== compassword){
    //         toast.error("Password Mismatch",{autoClose:2000})
    //         return
    //       }
    //       if(stats !== 'loading'){
    //         alert('please wait..',"info",false)
    //         await dispatch(
    //             ChangePass({
    //                 password,
    //                 id:userID
    //             })
    //         )
    //       }
    // }

  return (
    <div className='text-black  text-center bg-black my-auto overflow-hidden
    border-0 mx-auto mt-10
    '>
      {/* <ToastContainer position='top-center'  theme='dark'/> */}

        <p className='text-orange-500 text-xl font-bold'>New Password</p>
        <p className='text-orange-500 text-sm '>Enter Your New Preferd Password</p>

        <div className='mt-4 px-3 my-auto'>

             <input type="text" className='inpt mb-4'
             placeholder='New Password'
            //  onInput={(e)=>{
            //   setpassword(e.currentTarget.value)
            //  }}
             >
             </input>

             <input type="text" className='inpt'
             placeholder='Confirm New Password'
            //  onInput={(e)=>{
            //    setcompassword(e.currentTarget.value)
            //  }}
             >
             </input>

            
             <button className='btn w-full mt-10 h-8 mb-3'
            //  onClick={async ()=>{
            //   await checkInput()
            //  }}
             >
              Confirm
             </button>


        </div>
        
    </div>
  )
}

