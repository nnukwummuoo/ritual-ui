import React from "react";

type InfoTypes = {
  firstname: string,
  lastname: string,
  gender: string,
  birthday: string,
  location: string
}
export const Info = ({ firstname, lastname, gender, birthday, location }: InfoTypes) => {
  return (
    <div className="profile-card max-w-sm rounded-lg shadow-md bg-back p-6 pl-0 text-slate-300 mb-10">
      <div className="details space-y-2">
        <div className="pb-4 shadow-md shadow-slate-400 px-2 mb-4">
          <div className="flex flex-row justify-between items-center">
            <h4 className="font-bold text-md">FirstName</h4>
            <p className="text-md">{firstname}</p>
          </div>

          <div className="flex flex-row justify-between items-center">
            <h4 className="font-bold text-md">LastName</h4>
            <p className="text-md">{lastname}</p>
          </div>
        </div>

        <div className="pb-4 shadow-md shadow-slate-400 px-2">
          <div className="flex flex-row justify-between items-center ">
            <h4 className="font-bold text-md">Location</h4>
            <p className="text-md">{location}</p>
          </div>

          <div className="flex flex-row justify-between items-center ">
            <h4 className="font-bold text-md">Gender</h4>
            <p className="text-md">{gender}</p>
          </div>

          <div className="flex flex-row justify-between items-center">
            <h4 className="font-bold text-md">Birthday</h4>
            <p className="text-md">{birthday}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
