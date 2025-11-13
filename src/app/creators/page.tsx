/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
// import { useSelector, useDispatch } from "react-redux";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Modal from "@/components/modals";
import { useAuth } from "@/lib/context/auth-context";
import { countryList } from "@/components/CountrySelect/countryList";
import { CreatorCard, CreatorCardProps } from "./_components/card";
import CategoryButtonComponent from "./_components/CategoryButton";
import { getMyCreator, getAllCreators } from "@/api/creator";
import VIPBadge from "@/components/VIPBadge";
import FilterModal, { FilterState } from "./_components/FilterModal";

export default function CreatorPage() {
  // const login = useSelector((state: any) => state.register.logedin);
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

  const [requestclick, setrequestclick] = useState(false);
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
  const [categoryButton, setCategoryButton] = useState("All");
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    sortBy: "New Models",
    gender: null,
    region: null,
    ageMin: null,
    ageMax: null,
    searchQuery: "",
  });

  const buttonData = [
    { label: "All", value: "All" },
    { label: "Fan call", value: "fan call" },
    { label: "Fan meet", value: "fan meet" },
    { label: "Fan date", value: "fan date" },
  ];

  const regionButtonData = [
    { label: "All Regions", value: "All" },
    { label: "Asia", value: "Asia" },
    { label: "Europe", value: "Europe" },
    { label: "Africa", value: "Africa" },
    { label: "Americas", value: "Americas" },
    { label: "Oceania", value: "Oceania" },
  ];

  const toggleModal = () => setShowCountries((prev) => !prev);
  const handleCategorybutton = (value: string) => {
    setCategoryButton(value);
    // If "All" is selected, clear the filter (empty string shows all)
    setHosttypeSearchQuery(value === "All" ? "" : value);
  };

  const handleRegionFilter = (value: string) => {
    setRegionFilter(value === "All" ? null : value);
  };

  const handleFilterApply = (filters: FilterState) => {
    setFilterState(filters);
    setRegionFilter(filters.region);
    setGenderSearchQuery(filters.gender);
    setNameSearchQuery(filters.searchQuery);
  };

  const handleFilterClear = () => {
    setFilterState({
      sortBy: "New Models",
      gender: null,
      region: null,
      ageMin: null,
      ageMax: null,
      searchQuery: "",
    });
    setRegionFilter(null);
    setGenderSearchQuery(null);
    setNameSearchQuery("");
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
        // Use the fields parameter to get only needed data
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,flags");
        const data = await response.json();
        
        // Check if data is an array
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format from countries API");
        }
        
        const formattedCountries = data.map((country: any) => ({
          name: country.name?.common || country.name || "Unknown",
          flag: country.flags?.svg || "../../icons/Mappamondo.svg",
        }));

        const countriesWithAll = [
          { name: "All", flag: "../../icons/Mappamondo.svg" },
          ...formattedCountries,
        ];

        setDisplayedCountries(countriesWithAll);
        setCountries(countriesWithAll);
      } catch (error) {
        // Use fallback to local country list
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

  // VIP status is now included directly from backend, no need for separate API calls

  // Fetch creators based on authentication status
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        
        if (user?.session?._id) {
          // User is authenticated - fetch their own creators
          const res = await getMyCreator({ userid: user.session._id, token: user.session.token });
          
          // Handle different response formats
          const list = Array.isArray(res?.host) ? [...res.host] : 
                      Array.isArray(res) ? [...res] : 
                      Array.isArray(res?.data) ? [...res.data] : [];
          
          setMyCreators(list);
        } else {
          // User is not authenticated - fetch all creators
          const res = await getAllCreators();
          
          // Handle different response formats
          const list = Array.isArray(res?.host) ? [...res.host] : 
                      Array.isArray(res) ? [...res] : 
                      Array.isArray(res?.data) ? [...res.data] : [];
          
          setMyCreators(list);
        }
      } catch (e: any) {
        setMyCreators([]);
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

  // Try multiple fields in order - prioritize new backend structure
  const rawPhoto =
    // New backend structure: creatorfiles array
    (Array.isArray(m.creatorfiles) && m.creatorfiles.length > 0 
      ? pickValidPhoto(m.creatorfiles[0]?.creatorfilelink)
      : null) ||
    // Legacy fields for backward compatibility
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



  const cardData = {
    photolink: photo,
    hosttype: m.hosttype || m.category || "",
    name: m.name || m.fullName || "",
    age: Number(m.age || 0),
    gender: m.gender || "",
    location: m.location || "",
    interest: m.interestedin || m.interests || [],
    amount: amountNum,
    creator_portfolio_id: m.hostid || m._id || m.id || m.creator_portfolio_id || "",
    userid: m.userid || m.hostid || m.ownerId || "",
    createdAt: m.createdAt || m.created_at || "",
    hostid: m.hostid,
    // VIP status comes directly from backend
    isVip: m.isVip || false,
    vipEndDate: m.vipEndDate || null,
    // View count and online status for sorting - now provided by backend
    views: m.views || m.viewCount || m.view_count || m.totalViews || m.total_views || m.portfolioViews || m.portfolio_views || 0,
    isOnline: m.isOnline || m.online || m.is_online || m.onlineStatus || m.online_status || m.status === 'online' || false,
    // Following status for ranking - now provided by backend
    isFollowing: m.isFollowing || m.following || m.followingUser || m.is_following || m.following_status || m.followedBy || m.followed_by || false,
  };


  return cardData;
};



  // Calculate filtered and sorted list outside render function
  const list: CreatorCardProps[] = useMemo(() => {
    return myCreators.map((m) => {
      const card = mapToCard(m);
      return {
        ...card,
        photolink: card.photolink || "/images/default-placeholder.png",
      };
    });
  }, [myCreators]);

  // Filter creators based on all filters
  const filteredList = useMemo(() => {
    // Region to countries mapping - moved inside useMemo to avoid dependency issues
    const regionCountriesMap: Record<string, string[]> = {
      "Asia": [
        "Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan", "Brunei", "Cambodia", "China", 
        "Cyprus", "Georgia", "India", "Indonesia", "Iran", "Iraq", "Israel", "Japan", "Jordan", "Kazakhstan", 
        "Kuwait", "Kyrgyzstan", "Laos", "Lebanon", "Malaysia", "Maldives", "Mongolia", "Myanmar", "Nepal", 
        "North Korea", "Oman", "Pakistan", "Palestine", "Philippines", "Qatar", "Russia", "Saudi Arabia", 
        "Singapore", "South Korea", "Sri Lanka", "Syria", "Taiwan", "Tajikistan", "Thailand", "Timor-Leste", 
        "Turkey", "Turkmenistan", "United Arab Emirates", "Uzbekistan", "Vietnam", "Yemen"
      ],
      "Europe": [
        "Albania", "Andorra", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", 
        "Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", 
        "Iceland", "Ireland", "Italy", "Kosovo", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", 
        "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal", 
        "Romania", "Russia", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", 
        "Ukraine", "United Kingdom", "Vatican City"
      ],
      "Africa": [
        "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon", 
        "Central African Republic", "Chad", "Comoros", "Congo", "Côte d'Ivoire", "Djibouti", "Egypt", 
        "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", 
        "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", 
        "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "São Tomé and Príncipe", 
        "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", 
        "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe"
      ],
      "Americas": [
        "Antigua and Barbuda", "Argentina", "Bahamas", "Barbados", "Belize", "Bolivia", "Brazil", "Canada", 
        "Chile", "Colombia", "Costa Rica", "Cuba", "Dominica", "Dominican Republic", "Ecuador", "El Salvador", 
        "Grenada", "Guatemala", "Guyana", "Haiti", "Honduras", "Jamaica", "Mexico", "Nicaragua", "Panama", 
        "Paraguay", "Peru", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", 
        "Suriname", "Trinidad and Tobago", "United States", "Uruguay", "Venezuela"
      ],
      "Oceania": [
        "Australia", "Fiji", "Kiribati", "Marshall Islands", "Micronesia", "Nauru", "New Zealand", "Palau", 
        "Papua New Guinea", "Samoa", "Solomon Islands", "Tonga", "Tuvalu", "Vanuatu"
      ]
    };

    return list.filter((creator) => {
    // Filter by category (host type)
    let matchesCategory = true;
    if (categoryButton !== "All") {
      const creatorHostType = (creator.hosttype || "").toLowerCase().trim();
      const selectedCategory = categoryButton.toLowerCase().trim();
      matchesCategory = creatorHostType === selectedCategory;
    }

    // Filter by region
    let matchesRegion = true;
    const activeRegionFilter = filterState.region || regionFilter;
    if (activeRegionFilter && activeRegionFilter !== "All") {
      const creatorLocation = (creator.location || "").trim();
      const regionCountriesList = regionCountriesMap[activeRegionFilter] || [];
      
      // Check if creator's location matches any country in the selected region
      // Case-insensitive matching
      matchesRegion = regionCountriesList.some(country => 
        creatorLocation.toLowerCase().includes(country.toLowerCase()) ||
        country.toLowerCase().includes(creatorLocation.toLowerCase())
      );
    }

    // Filter by gender
    let matchesGender = true;
    const activeGenderFilter = filterState.gender || genderSearchQuery;
    if (activeGenderFilter) {
      const creatorGender = (creator.gender || "").trim().toLowerCase();
      const filterGender = activeGenderFilter.toLowerCase();
      // Handle different gender value formats
      if (filterGender === "female") {
        matchesGender = creatorGender === "female" || creatorGender === "woman" || creatorGender === "women";
      } else if (filterGender === "male") {
        matchesGender = creatorGender === "male" || creatorGender === "man" || creatorGender === "men";
      } else if (filterGender === "trans") {
        matchesGender = creatorGender === "trans" || creatorGender === "transgender" || creatorGender === "transsexual";
      } else if (filterGender === "couple") {
        matchesGender = creatorGender === "couple" || creatorGender === "couples";
      } else {
        // Fallback to simple includes check
        matchesGender = creatorGender.includes(filterGender) || filterGender.includes(creatorGender);
      }
    }

    // Filter by age
    let matchesAge = true;
    if (filterState.ageMin !== null || filterState.ageMax !== null) {
      const creatorAge = creator.age || 0;
      const age = typeof creatorAge === 'number' ? creatorAge : parseInt(String(creatorAge), 10) || 0;
      if (filterState.ageMin !== null && age < filterState.ageMin) {
        matchesAge = false;
      }
      if (filterState.ageMax !== null && age > filterState.ageMax) {
        matchesAge = false;
      }
    }

    // Filter by search query (name)
    let matchesSearch = true;
    const activeSearchQuery = filterState.searchQuery || nameSearchQuery;
    if (activeSearchQuery) {
      const creatorName = (creator.name || "").toLowerCase();
      matchesSearch = creatorName.includes(activeSearchQuery.toLowerCase());
    }

      return matchesCategory && matchesRegion && matchesGender && matchesAge && matchesSearch;
    });
  }, [list, categoryButton, filterState, regionFilter, genderSearchQuery, nameSearchQuery]);

  // Sort creators based on selected sort option
  const sortedList = useMemo(() => {
    // Create a copy to avoid mutating the original array
    const sorted = [...filteredList];
    return sorted.sort((a, b) => {
    const sortByOption = filterState.sortBy || "New Models";
    
    switch (sortByOption) {
      case "Most Views":
        // Sort by views (highest first)
        const viewsA = a.views || 0;
        const viewsB = b.views || 0;
        return viewsB - viewsA;
      
      case "New Models":
        // Sort by creation date (newest first)
        const newDateA = new Date(a.createdAt || 0).getTime();
        const newDateB = new Date(b.createdAt || 0).getTime();
        return newDateB - newDateA;
      
      case "Most Request":
        // For now, sort by views as a proxy for popularity/requests
        // TODO: Replace with actual request count when available
        const requestViewsA = a.views || 0;
        const requestViewsB = b.views || 0;
        // Secondary sort by creation date (newer first) to break ties
        if (requestViewsA === requestViewsB) {
          const requestDateA = new Date(a.createdAt || 0).getTime();
          const requestDateB = new Date(b.createdAt || 0).getTime();
          return requestDateB - requestDateA;
        }
        return requestViewsB - requestViewsA;
      
      default:
        // Default: Sort by creation date (newest first)
        const defaultDateA = new Date(a.createdAt || 0).getTime();
        const defaultDateB = new Date(b.createdAt || 0).getTime();
        return defaultDateB - defaultDateA;
    }
    });
  }, [filteredList, filterState.sortBy]);

const renderCreators = () => {
  if (loading) {
    return (
      <SkeletonTheme baseColor="#202020" highlightColor="#444">
        <div className="w-full p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2 mt-4 mb-12 md:grid-cols-3">
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded"
                >
                  <Skeleton 
                    width="100%" 
                    height={256}
                    className="rounded h-64 sm:h-80 md:h-96" 
                  />
                  <div className="absolute bottom-1 left-1 space-y-1">
                    <Skeleton width={60} height={20} className="rounded-lg" />
                    <Skeleton width={80} height={20} className="rounded-lg" />
                    <Skeleton width={50} height={20} className="rounded-lg" />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  if (!list.length) {
    return (
      <div className="mt-6 text-sm text-slate-400">
        {user?.session?._id ? "No portfolio yet." : "No creators found."}
      </div>
    );
  }

  if (!sortedList.length && list.length > 0) {
    return (
      <div className="mt-6 text-sm text-slate-400">
        No creators found for {categoryButton !== "All" ? `"${categoryButton}" category` : ""} {regionFilter && regionFilter !== "All" ? `in "${regionFilter}" region` : ""}.
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-2 mt-4 mb-12 md:grid-cols-3">
      {sortedList.map((value: CreatorCardProps) => (
        <li key={value.creator_portfolio_id || Math.random().toString(36)} className="relative">
          <CreatorCard {...value} />
          {/* VIP Badge - positioned at page level on top of verified creators */}
          {value.isVip && (
            <div className="absolute -top-1 left-20 ">
              <VIPBadge size="xxl" isVip={value.isVip} vipEndDate={value.vipEndDate} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};










  return (
    <div className="px-4 mt-2 sm:mx-4 relative">
      {/* Filter Button - Fixed position like in the image */}
        <button
          onClick={() => setShowFilterModal(true)}
          className="fixed bottom-32 right-4 z-50 bg-gray-900 hover:bg-blue-800 text-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Open filter"
        >
        <svg
          className="w-6 h-6 mb-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span className="text-xs font-semibold">Filter</span>
      </button>

      <div className="text-slate-200 sm:w-1/2 sm:ml-16 md:w-full md:ml-0 md:mt-10 md:overflow-auto">
        <CategoryButtonComponent
          buttons={buttonData}
          selected={categoryButton}
          onButtonClick={handleCategorybutton}
        />

        <div className="pb-11">{renderCreators()}</div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleFilterApply}
        onClear={handleFilterClear}
        totalCreators={myCreators.length}
        filteredCount={filteredList.length}
        initialFilters={filterState}
      />

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
                No countries found matching &ldquo;{searchQuery}&quot;
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}