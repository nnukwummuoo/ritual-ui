import React from 'react';
import { Mainpost } from './Mainpost';
import Link from 'next/link';
// import { useSelector } from 'react-redux';

function Upload() {
  const login = false; // Placeholder for login state, replace with actual state management
  // const login = useSelector((state) => state.register.logedin);
  // const navigate = useNavigate();

  // const handleRedirect = () => {
  //   navigate('/');
  // };

  return (
    <div style={{ padding: 10, paddingTop: 40 }}>
      {!login && (
        <div className="fixed w-full inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-5 px-10 rounded-lg shadow-lg text-center flex flex-col items-center gap-4">
            <p className="text-lg font-semibold text-gray-800">Please login to continue</p>
            <Link href={"/"}
              className="bg-orange-600 text-white px-4 py-2 rounded font-semibold"
            >
              OK
            </Link>
          </div>
        </div>
      )}
      <Mainpost />
    </div>
  );
}

export default Upload;
