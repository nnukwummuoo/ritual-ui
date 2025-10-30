'use client';

import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import PacmanLoader from 'react-spinners/DotLoader';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { getsearch, ProfilechangeStatus } from '@/store/profile';
import { UserList } from './_component/UserList';

interface User {
  photolink: string;
  name: string;
  country: string;
  gender: string;
  age: number;
  userid: string;
  username: string;
}

const SearchBar: React.FC = () => {
  const [listOfUsers, setListOfUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [color] = useState('#0f03fc');

  const searchStats = useSelector((state: RootState) => state.profile.searchstats);
  const searchUsers = useSelector((state: RootState) => state.profile.search_users);
  const dispatch = useDispatch<AppDispatch>();

  const showUsers = () => {
    if (!loading && listOfUsers.length > 0) {
      return listOfUsers.map((user, index) => (
        <UserList
          key={`${user.userid}_${index}`}
          photolink={user.photolink}
          name={user.name}
          country={user.country}
          gender={user.gender}
          age={user.age}
          userid={user.userid}
          username={user.username}
        />
      ));
    }
    return null;
  };

  useEffect(() => {
    if (searchStats !== 'loading') {
      setLoading(true);
      const fetchUsers = async () => {
        const result = await dispatch(getsearch());
        setListOfUsers(result.payload?.users || []);
      };
      fetchUsers();
    }
  }, []);

  useEffect(() => {
    if (searchStats === 'succeeded') {
      setLoading(false);
      dispatch(ProfilechangeStatus('idle'));
    }
  }, [searchStats]);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value.trim().toLowerCase();
    if (searchValue.length === 0) {
      setListOfUsers([]);
    } else {
      setListOfUsers(
        searchUsers.filter((user: any) => {
          const firstNameParts = user.name.split(' ');
          return (
            user.username.toLowerCase() === searchValue ||
            firstNameParts[0].toLowerCase() === searchValue ||
            (firstNameParts[1] && firstNameParts[1].toLowerCase() === searchValue) ||
            user.name.toLowerCase() === searchValue ||
            user.country.toLowerCase() === searchValue
          );
        })
      );
    }
  };

  return (
    <div className="w-screen mx-auto mb-3 bg-gray-900 sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12">
      <div className="relative md:mt-6 mt-16 m-auto w-[90%] sm:w-[60%] items-center sm:m-0 py-4">
        <div className='relative m-auto w-[90%] sm:w-[60%] items-center sm:m-0'>
            <FaSearch className="absolute text-gray-400 top-4 left-4" />
            <input
            type="text"
            placeholder="Search..."
            className="w-full px-12 py-3 m-auto text-white bg-gray-800 rounded-md focus:outline-none"
            onInput={handleSearchInput}
            />
        </div>

        {loading && (
          <div className="flex flex-col items-center mt-16">
            <PacmanLoader color={color} loading={loading} size={35} />
            <p className="text-sm text-center text-gray-600">Fetching users...</p>
          </div>
        )}

        <ul className="flex flex-col mt-3">{showUsers()}</ul>
      </div>
    </div>
  );
};

export default SearchBar;
