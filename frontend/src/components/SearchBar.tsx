import React from "react";
import { SelectOption } from "../types";

type Props = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectValue: string;
  setSelectValue: (value: string) => void;
};


const SearchBar: React.FC<Props> = ({ searchTerm, setSearchTerm, selectValue, setSelectValue }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <input
        type="text"
        placeholder="Search..."
        className="w-full py-1.5 px-3 font-normal border border-gray-300 rounded-md col-span-3"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select
        className="pt-1.5 pr-9 pb-1.5 pl-3 border border-gray-300 rounded-md"
        value={selectValue}
        onChange={(e) => setSelectValue(e.target.value)}
      >
        {Object.values(SelectOption).map((option) => (
          <option key={option} value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
export default SearchBar