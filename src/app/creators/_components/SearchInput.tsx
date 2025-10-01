import React from "react";
// import locationicon from "../../../../public/icons/locationIcon.svg";
// import locationicon from "/icons/locationIcon.svg";


type Props = {
  nameSearchQuery: string;
  setNameSearchQuery: (event: React.ChangeEvent<HTMLInputElement>) => void;
  toggleModal: () => void;
  locationSearchQuery: string | null;
};

const SearchInput: React.FC<Props> = ({
  nameSearchQuery,
  setNameSearchQuery,
  toggleModal,
  locationSearchQuery,
}) => {
  return (
    <div>
      <div className="pt-4 pl-2">
        <input
          type="text"
          className="inpt w-full pl-4 rounded-2xl"
          placeholder="Search by name"
          value={nameSearchQuery}
          onChange={setNameSearchQuery}
        />

        <div
          className="bg-orange-500 w-full rounded-full p-2 mt-2 text-center cursor-pointer"
          onClick={() => {}}
        >
          Search
        </div>
      </div>

      <div className="my-1 py-2 flex justify-end items-center">
        <button
          className="px-14 rounded-full border bg-white text-black"
          onClick={toggleModal}
        >
          <div className="flex">
           <img src="/icons/locationicon.svg" alt="location" />
            {/* <img src={locationicon} alt="location" /> */}
            <p>{locationSearchQuery || "All"}</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default SearchInput;
