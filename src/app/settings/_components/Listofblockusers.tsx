import React, {useState, useEffect} from 'react'
import type { StaticImageData } from 'next/image';
import PacmanLoader from "react-spinners/RotateLoader";
import person from "../../../icons/icons8-profile_Icon.png"
import onlineIcon from "../../../icons/onlineIcon.svg"
import offlineIcon from "../../../icons/offlineIcon.svg"
import { getCountryData } from '../../../api/getCountries';
// import {
import { deleteblockedUsers, getblockedUsers, ProfilechangeStatus } from '../../../store/profile';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store/store';

type ListOfBlockUsersProps = {
  id: string;
  photolink?: string;
  location: string;
  online: boolean;
  name: string;
};

export const Listofblockusers: React.FC<ListOfBlockUsersProps> = ({ id, photolink, location, online, name }) => {

let timeout: number | undefined;
const removeblockstats = useSelector((state: RootState) => state.profile.removeblockstats as string);
const token = useSelector((state: RootState) => state.register.refreshtoken as string);
const userid = useSelector((state: RootState) => state.register.userID as string);
const [loading, setloading] = useState(false);
// Store image as a string URL for use in <img src="..."/>
const [image, setimage] = useState<string>(typeof person === 'string' ? person : (person as StaticImageData).src);
let [color, setColor] = useState("#d49115");
let [disable, setdisable] = useState(false);
let [buttonpressed, set_buttonpressed] = useState(false)
const dispatch = useDispatch<AppDispatch>()

const [countryData, setCountryData] = useState({
    flag: "",
    abbreviation: "",
    fifa: "",
  });
  
  useEffect(() => {

    if(photolink){
      setimage(photolink)
    }
    const fetchData = async () => {
      const data = await getCountryData(location);
      if (data) setCountryData(data);
    };
    fetchData();
  }, []);

  const unblockClick = ()=>{
    if(removeblockstats !== "loading"){
      setloading(true)
      setdisable(true)
      dispatch(deleteblockedUsers({token,id}))
    }
  }

  useEffect(()=>{
    if(removeblockstats === "succeeded"){
      setloading(false)
      set_buttonpressed(false)
      dispatch(ProfilechangeStatus("idle"))
      dispatch(getblockedUsers({token,userid}))
      
    }
  },[removeblockstats])

  return (
    <div className="bg-slate-300 p-1 w-full rounded-lg"
    onMouseDown={(e)=>{
     
        timeout = window.setTimeout(()=>set_buttonpressed(true),1300)
      
    }}
    onTouchStart={(e)=>{
      
        timeout = window.setTimeout(()=>set_buttonpressed(true),1300)
      
    }}

    onMouseUp={(e)=>{
      clearTimeout(timeout)
    }}

    onTouchEnd={(e)=>{
      clearTimeout(timeout)
    }}
    >
      {buttonpressed && <button className='w-full text-center bg-slate-800' onClick={unblockClick} disabled={disable}>
        <p className='text-white font-bold'>Unblock User</p>
      </button>}

    {loading && (
      <div className="w-full flex flex-col items-center">
        <PacmanLoader
          color={color}
          loading={loading}
          size={10}
          aria-label="Loading Spinner"
          data-testid="loader"
        />

        <p className="text-xs">Unblocking user Please wait...</p>
      </div>
    )}

<div className="relative">
        <div>
          <img
            alt="verified"
            src={image}
            className="rounded h-80 w-full object-cover"
          />
        </div>

        <div className="absolute top-0 m-1 w-6 h-6 ">
          <img
            alt={online ? "online" : "offline"}
            src={online ? onlineIcon : offlineIcon}
            className={`object-cover rounded-full w-5 h-5 ${
              online ? "bg-[#d3f6e0]" : "bg-[#ffd8d9]"
            }`}
          />
        </div>

        <div className="absolute bottom-1">
          <div className="flex flex-row gap-2 items-center px-1  ">
            <div className="flex items-center p-1 gap-1 bg-black bg-opacity-40 rounded-lg ">
              <img
                src={countryData.flag}
                alt={`${countryData.abbreviation} flag`}
                className="w-3 h-3 object-cover rounded-full"
              />
              <span className="text-white text-xs ">{countryData.fifa}</span>
            </div>
           
            <h4 className="text-xs bg-black bg-opacity-50 rounded-lg p-1">
              {name}
            </h4>
          </div>
        </div>
      </div>

        
    </div>
  )
}
