import React from "react";
import { FaAngleRight } from "react-icons/fa";
import { FaAngleLeft } from "react-icons/fa";
import { IoHelpBuoy } from "react-icons/io5";
import { BiSupport } from "react-icons/bi";
import { MdOutlinePrivacyTip } from "react-icons/md";
import { GiWorld } from "react-icons/gi";
import { FaListCheck } from "react-icons/fa6";
import Head from "../../../components/Head";
import NavigateForward from "../_components/NavigateForward";



 const HelpSupportPage = () => {

  const navdata = [
   {
      name: "Speaker with support",
      icon: <BiSupport color="white" size={20} />,
      linktitle: "speak-to-help",
    },
    {
      name: "Term and conditions",
      icon: <FaListCheck color="white" size={20} />,
      linktitle: "T_&_C",
    },

    {
      name: "Privacy policy",
      icon: <MdOutlinePrivacyTip color="white" size={20} />,
      linktitle: "privacy-policy",
    },

    {
      name: "Community guidelines",
      icon: <GiWorld color="white" size={20} />,
      linktitle: "community",
    },
  ];
  return (
    <div className="w-screen mx-auto sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12">
   
      {/* <HeaderBackNav/> */}
     <div className='flex flex-col w-full px-4 md:px-0 '>
      <Head heading="HELP AND SUPPORT" />
      <p className="text-sm text-slate-400">
        See information about support option, and our policies
      </p>
      <div className="pt-4">
        {navdata.map((nav, index) => (
          <NavigateForward to={`help_&_support/${nav.linktitle}`} name={nav.name} icon={nav.icon} key={index} />
        ))}
      </div>
      </div>
    </div>
  );
};

export default HelpSupportPage;