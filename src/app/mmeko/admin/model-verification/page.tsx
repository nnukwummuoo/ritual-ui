"use client";

import { useEffect, useState } from "react";
// import { useAppSelector, useAppDispatch } from "@/lib/hooks";
// import { unverifiedHost, changemodelstatus } from "@/app/features/model/modelSlice";
import PacmanLoader from "react-spinners/RingLoader";
import dummy from "public/Images/dummy.jpg";
import Hostlist from "@/components/admin/confirmHost/Hostlist";

// Mocked list for demonstration
const mockHostList = [
  {
    userid: "123",
    firstname: "Emma",
    lastname: "Ola",
    username: "@tender",
    email: "emmylove961@gmail.com",
    dob: "2/2/1990",
    city: "Lagos",
    country: "Nigeria",
    recident_address: "Lagos",
    document_type: "International Passport",
    postlinkid: dummy,
    userphotolink: dummy,
  },
  {
    userid: "456",
    firstname: "Daniel",
    lastname: "Smith",
    username: "@daniel",
    email: "daniel@email.com",
    dob: "5/5/1992",
    city: "Abuja",
    country: "Nigeria",
    recident_address: "Abuja",
    document_type: "National ID",
    postlinkid: dummy,
    userphotolink: dummy,
  },
];

export default function VerifyModels() {
  // const dispatch = useAppDispatch();
  // const listofhost = useAppSelector((state) => state.model.Listofunverifiedhost);
  // const unverifiedhoststatus = useAppSelector((state) => state.model.unverifiedhoststatus);
  // const rejectmodelstatus = useAppSelector((state) => state.model.rejectmodelstatus);
  // const verifymodelstatus = useAppSelector((state) => state.model.verifymodelstatus);
  // const userid = useAppSelector((state) => state.register.userID);
  // const token = useAppSelector((state) => state.register.refreshtoken);
  // const admin = useAppSelector((state) => state.profile.admin);

  const [loading, setLoading] = useState(true);
  const color = "#d49115";

  useEffect(() => {
    // Simulate data fetch
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const renderHosts = () => {
    if (loading) return null;

    if (mockHostList.length === 0) {
      return (
        <div className="w-full h-16 flex justify-center mt-16">
          <p className="text-white text-sm">No unverified host at the moment!!</p>
        </div>
      );
    }

    return (
      <ul className="w-full px-2">
        {mockHostList.map((host, idx) => (
          <li key={`${host.userid}_${idx}`}>
            <Hostlist prob={host} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="min-h-screen w-screen mx-auto sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-9/12 mt-14 md:mt-8">
      <div className="flex flex-col items-center w-full mt-12">
        <p className="jost text-[1.3em] text-white py-4 font-[500]">Verify new models</p>

        {loading && (
          <div className="flex flex-col items-center mt-16 w-full">
            <PacmanLoader color={color} loading={loading} size={70} />
            <p className="jost text-white mt-2">Getting list of unverified host...</p>
          </div>
        )}

        {renderHosts()}
      </div>
    </div>
  );
}
