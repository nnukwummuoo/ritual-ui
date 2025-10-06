import React from 'react'
import { BiTimeFive } from "react-icons/bi";
import RequestCard from '../components/RequestCard';

export default function Activity() {
  return <div className='flex flex-col gap-8 max-w-[26rem] mx-auto'>
    <RequestCard type="Fan" img="/picture-2.jfif" status={"request"} name='Hazel Hazel' titles={["Creator"]} exp='23h, 14m, 8s' />
    <RequestCard type="creator" img='/picture-1.jfif' status={"request"} name='Maxwell Dickson'  exp='23h, 14m, 8s'/>
    <RequestCard type="creator" img='/picture-1.jfif' status={"accepted"} name='Maxwell Dickson' exp='23h, 14m, 8s'/>
    <RequestCard type="creator" img='/picture-1.jfif' status={"completed"} name='Maxwell Dickson' exp='23h, 14m, 8s'/>
    <RequestCard type="creator" img="/picture-1.jfif" status={"expired"} name='Maxwell Dickson' exp='23h, 14m, 8s' />
    <RequestCard type="Fan" img="/picture-2.jfif" status={"expired"} name='Hazel Hazel' titles={["Creator"]} exp='23h, 14m, 8s' />
    <RequestCard type="creator" img='/picture-1.jfif' status={"declined"} name='Maxwell Dickson' exp='23h, 14m'/>
    <RequestCard type="Fan" img="/picture-2.jfif" status={"declined"} name='Hazel Hazel' titles={["Creator"]} exp='23h, 14m, 8s' />
    <RequestCard type="Fan" img="/picture-2.jfif" status={"completed"} name='Hazel Hazel' titles={["Creator"]} exp='23h, 14m, 8s' />
    <RequestCard type="creator" img='/picture-1.jfif' status={"cancelled"} name='Maxwell Dickson' exp='23h, 14m, 8s'/>
    <RequestCard type="Fan" img="/picture-2.jfif" status="accepted" name='Hazel Hazel'  titles={["Creator"]} exp='23h, 14m, 8s' />
    <RequestCard type="Fan" img="/picture-2.jfif" status="cancelled" name='Hazel Hazel' titles={["Creator"]} exp='23h, 14m, 8s' />
  </div>
}
