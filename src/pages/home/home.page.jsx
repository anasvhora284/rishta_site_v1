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
        const excelData = excelDataResponse.data;

        if (excelData && excelData.length > 0) {
          // Extract headers from the first array
          const headers = excelData[0];

          // Convert the rest of the arrays into objects
          const processedData = excelData.slice(1).map((row) => {
            const obj = {};
            headers.forEach((header, index) => {
              // Map header names to appropriate keys
              switch (header) {
                case "ID No.":
                  obj.id = row[index];
                  break;
                case "Name of Boy/Girl":
                  obj.name = row[index];
                  break;
                case "Gender":
                  obj.gender = row[index];
                  break;
                case "Boy's / Girl's Current Profile ":
                  obj.currentProfile = row[index];
                  break;
                case "Father's Name":
                  obj.fatherName = row[index];
                  break;
                case "Father's Occupation":
                  obj.fatherOccupation = row[index];
                  break;
                case "Mother's Name":
                  obj.motherName = row[index];
                  break;
                case "City / Village":
                  obj.cityVillage = row[index];
                  break;
                case "Date of Birth":
                  obj.dateOfBirth = row[index];
                  break;
                case "Marital Status":
                  obj.maritalStatus = row[index];
                  break;
                case "Height":
                  obj.height = row[index];
                  break;
                case "Weight/Other Information":
                  obj.weight = row[index];
                  break;
                case "Parent's Contact Number [Preferably WhatsApp] ":
                  obj.contactNumber = row[index];
                  break;
                case "68 Sub Cast ":
                  obj.subCast = row[index];
                  break;
                case "Qualification":
                  obj.qualification = row[index];
                  break;
                default:
                  obj[header] = row[index];
              }
            });
            return obj;
          });

          // Set the processed data in the state variable
          setExcelData(processedData);
        }
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
