'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { PacmanLoader } from 'react-spinners';
import { unverifiedHost, changecreatorstatus } from '@/store/creatorSlice';
// import { Hostlist } from '../../components/creatorviews/confirmhostAdmin/Hostlist';
import dummy from '../../Images/dummy.jpg';
import Hostlist from '@/components/admin/confirmHost/Hostlist';

interface RootState {
  creator: {
    Listofunverifiedhost: any[];
    unverifiedhoststatus: string;
    rejectcreatorstatus: string;
    verifycreatorstatus: string;
  };
  register: {
    userID: string;
    refreshtoken: string;
  };
  profile: {
    admin: boolean;
  };
}

const VerifyCreatorsPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const listofhost = useSelector((state: RootState) => state.creator.Listofunverifiedhost);
  const unverifiedhoststatus = useSelector((state: RootState) => state.creator.unverifiedhoststatus);
  const userid = useSelector((state: RootState) => state.register.userID);
  const token = useSelector((state: RootState) => state.register.refreshtoken);
  const admin = useSelector((state: RootState) => state.profile.admin);
  const rejectcreatorstatus = useSelector((state: RootState) => state.creator.rejectcreatorstatus);
  const verifycreatorstatus = useSelector((state: RootState) => state.creator.verifycreatorstatus);

  const [disablehost, setDisable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [color] = useState('#d49115');

  // Redirect if not admin
  // useEffect(() => {
  //   if (!admin) {
  //     router.push('/');
  //   }
  // }, [admin, router]);

  // Fetch unverified hosts
  useEffect(() => {
    if (unverifiedhoststatus !== 'loading') {
    //   dispatch(unverifiedHost({ userid, token }));
    }
  }, [dispatch, token, userid, unverifiedhoststatus]);

  useEffect(() => {
    if (unverifiedhoststatus === 'succeeded' || unverifiedhoststatus === 'failed') {
      setLoading(false);
    }
  }, [unverifiedhoststatus]);

  useEffect(() => {
    if (rejectcreatorstatus === 'succeeded' || verifycreatorstatus === 'succeeded') {
      setLoading(false);
      setDisable(false);
      dispatch(changecreatorstatus('idle'));
    }
  }, [rejectcreatorstatus, verifycreatorstatus, dispatch]);

  const renderHostList = () => {
    if (!loading) {
      if (listofhost.length > 0) {
        return (
          <ul className="w-full pl-2 pr-2">
            {listofhost.map((host, index) => (
              <li key={`${host.userid}_${index}`}>
                <Hostlist prob={host} />
              </li>
            ))}
          </ul>
        );
      } else {
        return (
          <div className="w-full h-16 flex justify-center mt-16">
            <p className="text-white text-sm">No unverified host at the moment!!</p>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="w-screen sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 mx-auto bg-gray-900">
      <div className="w-full h-full flex flex-col items-center md:w-2/4 mt-12 md:mt-0">
        <p className="jost text-[1.3em] text-white py-4 font-[500]">
          Verify new creators
        </p>

        {loading && (
          <div className="flex flex-col items-center justify-center mt-16 w-full text-center">
            <PacmanLoader
              color={color}
              loading={loading}
              size={70}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
            <p className="jost text-white mt-7">Getting list of unverified hosts...</p>
          </div>
        )}

        {renderHostList()}
      </div>
    </div>
  );
};

export default VerifyCreatorsPage;
