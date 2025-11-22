import React from 'react';
import { Search } from 'lucide-react';
import Input from '../../components/ui/Input';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm }) => (
  <div className="relative mb-8">
    <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
    <Input
      type="search"
      placeholder="Buscar"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full max-w-sm pl-10 bg-gray-50"
    />
  </div>
);

export default SearchBar;
