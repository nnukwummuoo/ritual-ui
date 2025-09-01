"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { unverifiedHost } from "@/store/modelSlice";
import PacmanLoader from "react-spinners/RingLoader";
import Hostlist from "@/components/admin/confirmHost/Hostlist";
import { useUserId } from "@/lib/hooks/useUserId";

export default function VerifyModels() {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((s: RootState) => s.register.refreshtoken);
  const userid = useUserId();
  const status = useSelector((s: RootState) => s.model.unverifiedhoststatus);
  const hosts = useSelector((s: RootState) => s.model.Listofunverifiedhost as any[]);

  useEffect(() => {
    if (status === "idle") {
      dispatch(unverifiedHost({ token, userid:""+userid}));
    }
  }, [dispatch, status, token]);

  const loading = status === "loading";

  return (
    <div className="min-h-screen w-screen mx-auto sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-9/12 mt-14 md:mt-8">
      <div className="flex flex-col items-center w-full mt-12">
        <p className="jost text-[1.3em] text-white py-4 font-[500]">Verify new models</p>

        {loading && (
          <div className="flex flex-col items-center mt-16 w-full">
            <PacmanLoader color="#d49115" loading={loading} size={70} />
            <p className="jost text-white mt-2">Getting list of unverified host...</p>
          </div>
        )}

        {!loading && (!hosts || hosts.length === 0) && (
          <div className="w-full h-16 flex justify-center mt-16">
            <p className="text-white text-sm">No unverified host at the moment!!</p>
          </div>
        )}

        {!loading && hosts && hosts.length > 0 && (
          <ul className="w-full px-2">
            {hosts.map((host: any, idx: number) => (
              <li key={`${host.userid || host.id || idx}_${idx}`}>
                <Hostlist prob={{
                  userid: host.userid || host.id,
                  firstname: host.firstname || host.firstName || "",
                  lastname: host.lastname || host.lastName || "",
                  username: host.username || "",
                  email: host.email || "",
                  dob: host.dob || "",
                  city: host.city || "",
                  country: host.country || "",
                  address: host.recident_address || host.address,
                  holdingIdPhoto: host.holdingIdPhotofile || host.postlinkid,
                  idPhoto: host.idPhotofile || host.userphotolink,
                  image: host.image,
                }} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
