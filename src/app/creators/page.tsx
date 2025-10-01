"use client";

import React, { useState, useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Modal from "@/components/modals";
import { useAuth } from "@/lib/context/auth-context";
import { countryList } from "@/components/CountrySelect/countryList";
import { CreatorCard, CreatorCardProps } from "./_components/card";
import CategoryButtonComponent from "./_components/CategoryButton";
import { getMyCreator } from "@/api/creator";

export default function CreatorPage() {
  // const login = useSelector((state: any) => state.register.logedin);
  // const dispatch = useDispatch();
  // const mycreatorstatus = useSelector((state: any) => state.creator.mycreatorstatus);
  // const message = useSelector((state: any) => state.creator.message);
  // const mycreator = useSelector((state: any) => state.creator.mycreator);
  // const userid = useSelector((state: any) => state.register.userID);
  // const token = useSelector((state: any) => state.register.refreshtoken);
  // const ListofVerihost = useSelector(
  //   (state: any) => state.creator.ListofLivehost
  // );
  // const Listofhoststatus = useSelector(
  //   (state: any) => state.creator.Listofhoststatus
  // );

  const [ searchQuery, setSearchQuery] = useState("");
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
  const [myCreators, setMyCreators] = useState<any[]>([]);
  const [showmycreator, setshowmycreator] = useState(false);
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

  // const filterCreators = ListofVerihost.filter((creator: any) => {
  //   const matchesName = nameSearchQuery
  //     ? creator.name.toLowerCase().includes(nameSearchQuery.toLowerCase())
  //     : true;
  //   const matchesHostType = hosttypeSearchQuery
  //     ? creator.hosttype.toLowerCase().includes(hosttypeSearchQuery.toLowerCase())
  //     : true;
  //   const matchesGender = genderSearchQuery
  //     ? creator.gender.includes(genderSearchQuery)
  //     : true;
  //   const matchesLocation = locationSearchQuery
  //     ? creator.location.toLowerCase().includes(locationSearchQuery.toLowerCase())
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

  // Fetch my created creators when session is available
  useEffect(() => {
    const run = async () => {
      try {
        // session may be null initially; wait until present
        if (!user?.session?._id) {
          setLoading(false);
          return;
        }
        setLoading(true);
        const res = await getMyCreator({ userid: user.session._id, token: user.session.token });
        const list = [...(res?.host||[])]
        console.log("[GET /creator] parsed list length:", list.length);
        setMyCreators(list);
      } catch (e) {
        // console only, UI remains simple
        console.error("Failed to load my creators", e);
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.session?._id]);

  // useEffect(() => {
  //   if (mycreatorstatus !== "loading") {
  //     dispatch(getmycreator({ userid: "", token: "" }));
  //   }
  //   if (Listofhoststatus !== "loading") {
  //     dispatch(getverifyhost({ token }));
  //   }
  // }, []);

  // useEffect(() => {
  //   if (mycreatorstatus === "succeeded") {
  //     dispatch(changecreatorstatus("idle"));
  //     setLoading(false);
  //     if (mycreator.length > 0) setshowmycreator(true);
  //   }
  //   if (mycreatorstatus === "failed") dispatch(changecreatorstatus("idle"));
  //   if (Listofhoststatus === "succeeded") {
  //     dispatch(changecreatorstatus("idle"));
  //     setLoading1(false);
  //     setshowhost(true);
  //   }
  //   if (Listofhoststatus === "failed") dispatch(changecreatorstatus("idle"));
  // }, [mycreatorstatus, Listofhoststatus]);

  

const mapToCard = (m: any): CreatorCardProps => {
  // Helper: pick first valid string from array or single value
  const pickValidPhoto = (value: any) => {
    if (!value) return null;
    if (Array.isArray(value)) {
      for (const v of value) {
        if (typeof v === "string" && v.trim() !== "") return v;
      }
      return null;
    }
    if (typeof value === "string" && value.trim() !== "") return value;
    return null;
  };

  // Try multiple fields in order
  let rawPhoto =
    pickValidPhoto(m.photolink) ||
    pickValidPhoto(m.photo) ||
    pickValidPhoto(m.image) ||
    pickValidPhoto(m.images) ||
    pickValidPhoto(m.photos);

  // If relative path (starts with "./" or no protocol), prepend base URL
  const photo =
    rawPhoto && !rawPhoto.startsWith("http")
      ? `${process.env.NEXT_PUBLIC_BASE_URL || ""}${rawPhoto.replace(/^\.?\//, "/")}`
      : rawPhoto;

  // Parse amount
  const amountVal = m.price ?? m.amount ?? 0;
  let amountNum = 0;
  if (typeof amountVal === "string") {
    const digits = amountVal.replace(/[^0-9]/g, "");
    amountNum = digits ? parseInt(digits, 10) : 0;
  } else if (typeof amountVal === "number") {
    amountNum = amountVal;
  }

  return {
    photolink: photo,
    hosttype: m.hosttype || m.category || "",
    online: Boolean(m.online),
    name: m.name || m.fullName || "",
    age: Number(m.age || 0),
    gender: m.gender || "",
    location: m.location || "",
    interest: m.interestedin || m.interests || [],
    amount: amountNum,
    creatorid: m._id || m.id || m.creatorid || "",
    userid: m.userid || m.hostid || m.ownerId || "",
    createdAt: m.createdAt || m.created_at || "",
    hostid: m.hostid,
  };
};



const renderCreators = () => {
  if (loading) {
    return (
      <SkeletonTheme baseColor="#202020" highlightColor="#444">
        <div className="w-full p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="relative flex flex-col items-center p-4 bg-[#121212] rounded-lg"
                >
                  <Skeleton width={150} height={250} className="rounded-lg" />
                </div>
              ))}
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  if (!user?.session?._id) {
    return (
      <div className="mt-6 text-sm text-slate-400">
        Please log in to view creators.
      </div>
    );
  }

  const list: CreatorCardProps[] = myCreators.map((m) => {
    const card = mapToCard(m);
    return {
      ...card,
      photolink: card.photolink || "/images/default-placeholder.png", // fallback image
    };
  });

  if (!list.length) {
    return (
      <div className="mt-6 text-sm text-slate-400">
        No listing yet.
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-2 mt-4 mb-12 md:grid-cols-3">
      {list.map((value) => (
        <CreatorCard
          key={value.creatorid || Math.random().toString(36)}
          {...value}
        />
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

        <div className="pb-11">{renderCreators()}</div>
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