"use client";

import React, { useState, useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Modal from "@/components/modals";
import { useAuth } from "@/lib/context/auth-context";
import { countryList } from "@/components/CountrySelect/countryList";
import { ModelCard, ModelCardProps } from "./_components/card";
import CategoryButtonComponent from "./_components/CategoryButton";

export default function ModelPage() {
  // const login = useSelector((state: any) => state.register.logedin);
  // const dispatch = useDispatch();
  // const mymodelstatus = useSelector((state: any) => state.model.mymodelstatus);
  // const message = useSelector((state: any) => state.model.message);
  // const mymodel = useSelector((state: any) => state.model.mymodel);
  // const userid = useSelector((state: any) => state.register.userID);
  // const token = useSelector((state: any) => state.register.refreshtoken);
  // const ListofVerihost = useSelector(
  //   (state: any) => state.model.ListofLivehost
  // );
  // const Listofhoststatus = useSelector(
  //   (state: any) => state.model.Listofhoststatus
  // );

  const [searchQuery, setSearchQuery] = useState("");
  const [nameSearchQuery, setNameSearchQuery] = useState("");
  const [hosttypeSearchQuery, setHosttypeSearchQuery] = useState("");
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [genderSearchQuery, setGenderSearchQuery] = useState<string | null>(
    null
  );

  const [Bookclick, setbookclick] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showCountries, setShowCountries] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [displayedCountries, setDisplayedCountries] = useState<any[]>([]);
  const [manualCountries, setManualCountries] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [loading1, setLoading1] = useState(true);
  const [showmymodel, setshowmymodel] = useState(false);
  const [showhost, setshowhost] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [categoryButton, setCategoryButton] = useState(" ");

  const buttonData = [
    { label: "Fan Call", value: "Fan Call" },
    { label: "Fan meet", value: "Fan meet" },
    { label: "Fan date", value: "Fan date" },
  ];

  const toggleModal = () => setShowCountries((prev) => !prev);
  const handleCategorybutton = (value: string) => {
    setCategoryButton(value);
    setHosttypeSearchQuery(value);
  };

  const toggleFullPageModal = () => setModalOpen(!isModalOpen);

  const filteredCountries = displayedCountries.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredManualCountries = manualCountries.filter((country) =>
    country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // const filterModels = ListofVerihost.filter((model: any) => {
  //   const matchesName = nameSearchQuery
  //     ? model.name.toLowerCase().includes(nameSearchQuery.toLowerCase())
  //     : true;
  //   const matchesHostType = hosttypeSearchQuery
  //     ? model.hosttype.toLowerCase().includes(hosttypeSearchQuery.toLowerCase())
  //     : true;
  //   const matchesGender = genderSearchQuery
  //     ? model.gender.includes(genderSearchQuery)
  //     : true;
  //   const matchesLocation = locationSearchQuery
  //     ? model.location.toLowerCase().includes(locationSearchQuery.toLowerCase())
  //     : true;
  //   return matchesName && matchesLocation && matchesHostType && matchesGender;
  // });

  useEffect(() => {
    const countriesWithAll = ["All", ...countryList];
    setManualCountries(countriesWithAll);
  }, []);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        const data = await response.json();
        const formattedCountries = data.map((country: any) => ({
          name: country.name.common,
          flag: country.flags.svg,
        }));

        const countriesWithAll = [
          { name: "All", flag: "../../icons/Mappamondo.svg" },
          ...formattedCountries,
        ];

        setDisplayedCountries(countriesWithAll);
        setCountries(countriesWithAll);
      } catch (error) {
        console.log("Error fetching countries:", error);
        const fallbackCountries = ["All", ...countryList].map((country) => ({
          name: country,
          flag: "../../icons/Mappamondo.svg",
        }));
        setDisplayedCountries(fallbackCountries);
        setCountries(fallbackCountries);
      }
    };

    fetchCountries();
  }, []);

  const user = useAuth();

  // useEffect(() => {
  //   if (mymodelstatus !== "loading") {
  //     dispatch(getmymodel({ userid: "", token: "" }));
  //   }
  //   if (Listofhoststatus !== "loading") {
  //     dispatch(getverifyhost({ token }));
  //   }
  // }, []);

  // useEffect(() => {
  //   if (mymodelstatus === "succeeded") {
  //     dispatch(changemodelstatus("idle"));
  //     setLoading(false);
  //     if (mymodel.length > 0) setshowmymodel(true);
  //   }
  //   if (mymodelstatus === "failed") dispatch(changemodelstatus("idle"));
  //   if (Listofhoststatus === "succeeded") {
  //     dispatch(changemodelstatus("idle"));
  //     setLoading1(false);
  //     setshowhost(true);
  //   }
  //   if (Listofhoststatus === "failed") dispatch(changemodelstatus("idle"));
  // }, [mymodelstatus, Listofhoststatus]);

  const dummyData: ModelCardProps[] = [
    {
      photolink:
        "https://cloud.appwrite.io/v1/storage/buckets/model/files/68741ad10008207256ee/view?project=668f9f8c0011a761d118",
      hosttype: "Fan Meet",
      online: true,
      name: "John",
      age: 25,
      gender: "Male",
      location: "Nigeria",
      interest: [],
      amount: 25,
      modelid: "fjl",
      userid: "",
      createdAt: "",
    },
    {
      photolink:
        "https://cloud.appwrite.io/v1/storage/buckets/model/files/6874269a00152815f29c/view?project=668f9f8c0011a761d118",
      hosttype: "Fan Date",
      online: true,
      name: "Mary",
      age: 25,
      gender: "Male",
      location: "PHI",
      interest: [],
      amount: 25,
      modelid: "45w",
      userid: "",
      createdAt: "",
    },
    {
      photolink:
        "https://cloud.appwrite.io/v1/storage/buckets/model/files/68741fbc002780de7380/view?project=668f9f8c0011a761d118",
      hosttype: "Fan Call",
      online: false,
      name: "Sarah",
      age: 25,
      gender: "Male",
      location: "AFG",
      interest: [],
      amount: 25,
      modelid: "5ff",
      userid: "",
      createdAt: "",
    },
  ];

  const renderModels = () => {
    // if (loading1) {
    //   return (
    //     <SkeletonTheme baseColor="#202020" highlightColor="#444">
    //       <div className="w-full p-4 space-y-4">
    //         <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
    //           {Array(10)
    //             .fill(0)
    //             .map((_, index) => (
    //               <div
    //                 key={index}
    //                 className="relative flex flex-col items-center p-4 bg-[#121212] rounded-lg"
    //               >
    //                 <Skeleton width={150} height={250} className="rounded-lg" />
    //               </div>
    //             ))}
    //         </div>
    //       </div>
    //     </SkeletonTheme>
    //   );
    // }

    // const sortedModels = [...filterModels].sort((a, b) => {
    //   if (a.online && !b.online) return -1;
    //   if (!a.online && b.online) return 1;
    //   const viewsA = Number(a.views || 0);
    //   const viewsB = Number(b.views || 0);
    //   return viewsB - viewsA;
    // });

    // const onlineModels = sortedModels.filter((model) => model.online);
    // const offlineModels = sortedModels.filter((model) => !model.online);

    return (
      <ul className="grid grid-cols-2 gap-2 mt-4 mb-12 md:grid-cols-3">
        {dummyData.map((value) => (
          <ModelCard key={value.modelid} {...value} />
        ))}
      </ul>
    );
  };

  return (
    <div className="px-4 mt-10 sm:mx-10">
      <div className="text-slate-200 sm:w-1/2 sm:ml-16 md:w-full md:ml-0 md:mt-10 md:overflow-auto">
        <CategoryButtonComponent
          buttons={buttonData}
          selected={categoryButton}
          onButtonClick={handleCategorybutton}
        />

        {/* {login && (
          <>
            {categoryButton !== " " && (
              <div className="flex items-center">
                <FaAngleLeft
                  color="green"
                  size={20}
                  onClick={() => {
                    handleCategorybutton(" ");
                    setHosttypeSearchQuery("");
                  }}
                />
                <h3 className="font-bold text-green-600 text-md">
                  #{categoryButton.toLowerCase()}
                </h3>
              </div>
            )}

            <button
              className="mt-2 text-blue-300 hover:underline focus:outline-none"
              onClick={() => setShowOptions(!showOptions)}
            >
              {showOptions ? "Hide Options" : "Options"}
            </button>

            {showOptions && (
              <>
                <div className="flex items-center justify-between px-2 ml-1 mr-1 text-xs font-bold text-white">
                  {[
                    { label: "Featured", icon: features, query: null },
                    { label: "Women", icon: femaleIcon, query: "Woman" },
                    { label: "Men", icon: maleIcon, query: "Man" },
                    { label: "Trans", icon: transIcon, query: "Trans" },
                    { label: "Couple", icon: CoupleIcon, query: "Couple" },
                  ].map((item, index) => (
                    <button
                      key={index}
                      className="flex mt-3"
                      onClick={() => setGenderSearchQuery(item.query)}
                    >
                      <img
                        src={item.icon}
                        alt={item.label}
                        className="object-cover w-5 h-5 md:w-7 md:h-7"
                      />
                      <p className="mt-1 ml-1">{item.label}</p>
                    </button>
                  ))}
                </div>

                <SearchInput
                  nameSearchQuery={nameSearchQuery}
                  setNameSearchQuery={(e: any) =>
                    setNameSearchQuery(e.target.value)
                  }
                  toggleModal={toggleFullPageModal}
                  locationSearchQuery={locationSearchQuery}
                />
              </>
            )}
          </>
        )} */}

        <div className="pb-11">{renderModels()}</div>
      </div>

      <Modal
        isOpen={isModalOpen}
        title="All Countries"
        onClose={toggleFullPageModal}
      >
        <input
          placeholder="Search countries.."
          className="w-full px-2 py-2 text-black border rounded-lg border-slate-200 placeholder:px-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="pt-4 overflow-y-scroll h-80">
          <div className="flex flex-wrap gap-4">
            {filteredManualCountries.map((country, index) => (
              <button
                key={index}
                className="flex items-center gap-2 p-2 bg-white border rounded-full border-slate-300 hover:bg-slate-200 hover:text-white focus:bg-black focus:text-white"
                onClick={() => {
                  setLocationSearchQuery(country === "All" ? "" : country);
                  toggleFullPageModal();
                  toggleModal();
                  setSearchQuery("");
                }}
              >
                <span className="text-sm text-black">{country}</span>
              </button>
            ))}

            {filteredManualCountries.length === 0 && searchQuery && (
              <div className="text-center text-gray-500 mt-4">
                No countries found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
