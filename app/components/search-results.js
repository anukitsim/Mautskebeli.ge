"use client"


import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const SearchResult = () => {
  const [searchResults, setSearchResults] = useState([]);
  const router = useRouter();
  const { query } = router.query; // Assuming 'query' is the dynamic part of your URL

  useEffect(() => {
    if (!query) return;
    const fetchData = async () => {
      const encodedQuery = encodeURIComponent(query);
      const postTypes = ["mecniereba", "medicina", "msoflio", "saxli", "kalaki", "shroma", "xelovneba"];
      try {
        const promises = postTypes.map(type =>
          fetch(`http://mautskebeli.local/wp-json/wp/v2/${type}?search=${encodedQuery}`)
        );
        const responses = await Promise.all(promises);
        const data = await Promise.all(responses.map(res => res.json()));
        setSearchResults(data.flat()); // Flatten the array of arrays into a single array of results
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [query]);

  return (
    <div>
      {searchResults.length > 0 ? searchResults.map((item) => (
        <div key={item.id}>
          <h2>{item.title.rendered}</h2>
          <p>{item.content.rendered}</p>
        </div>
      )) : <p>No results found for {query}.</p>}
    </div>
  );
}

export default SearchResult;
