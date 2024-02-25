import axios from "axios";
import { useEffect, useState } from "react";
import Filter from "../filter/filter.page";
import Listing from "../listing/listing.page";

const Home = () => {
  const [excelData, setExcelData] = useState([]);
  const [currentPage, setCurrentPage] = useState("filter");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all Excel data
        const excelDataResponse = await axios.get(
          "https://script.google.com/macros/s/AKfycbwtA1B-M3F3V-53MoKt2PgPGgBQOfLzst4ckDvsjI7xJgdTOyuyPcS7fbBzhALBI8g/exec"
        );
        setExcelData(excelDataResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      {currentPage === "listing" ? (
        <Listing
          setCurrentPage={setCurrentPage}
          excelData={excelData}
          setExcelData={setExcelData}
        />
      ) : (
        <Filter setCurrentPage={setCurrentPage} />
      )}
    </>
  );
};

export default Home;
