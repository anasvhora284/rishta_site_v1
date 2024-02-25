/* eslint-disable no-debugger */
import axios from "axios";
import { useEffect, useState } from "react";
import Filter from "../filter/filter.page";
import Listing from "../listing/listing.page";

const Home = () => {
  const [excelData, setExcelData] = useState([]);
  const [currentPage, setCurrentPage] = useState("filter");
  const [cityValues, setCityValues] = useState([]);
  const [qualificationValues, setQualificationValues] = useState([]);
  const [maritalStatusValues, setMaritalStatusValues] = useState([]);
  const [genderData, setGenderData] = useState([]);

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
                  obj.gender = String(row[index]).toLowerCase();
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
                  obj.cityVillage = String(row[index]).toLowerCase();
                  break;
                case "Date of Birth":
                  obj.dateOfBirth = row[index];
                  break;
                case "Marital Status":
                  obj.maritalStatus = String(row[index]).toLowerCase();
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
                  obj.qualification = String(row[index]).toLowerCase();
                  break;
                default:
                  obj[header] = row[index];
              }
            });
            obj.education = row[3];
            return obj;
          });

          const cities = excelData
            .slice(1) // Skip the header row
            .map(
              (row) =>
                row[8]?.charAt(0).toLowerCase() + row[8].slice(1).toLowerCase()
            ) // Convert to lowercase
            .filter(
              (city) =>
                city !== undefined && city !== null && city.trim() !== ""
            ); // Filter out empty values

          setCityValues((prevCities) => {
            const uniqueCities = Array.from(
              new Set([...prevCities, ...cities])
            );
            return uniqueCities;
          });

          // Extract qualifications from the 16th column (index 15) of Excel data
          const qualifications = excelData
            .slice(1) // Skip the header row
            .map((row) =>
              (
                row[15].charAt(0).toLowerCase() + row[15].slice(1).toLowerCase()
              ).trim()
            ); // Convert to lowercase
          setQualificationValues((prevQualifications) => {
            const uniqueQualifications = [
              ...new Set([...prevQualifications, ...qualifications]),
            ];
            return uniqueQualifications;
          });

          // Extract marital statuses from the 11th column (index 10) of Excel data
          const maritalStatuses = excelData
            .slice(1) // Skip the header row
            .map((row) =>
              (
                row[10].charAt(0).toLowerCase() + row[10].slice(1).toLowerCase()
              ).trim()
            ); // Convert to lowercase
          setMaritalStatusValues((prevMaritalStatuses) => {
            const uniqueMaritalStatuses = Array.from(
              new Set([...prevMaritalStatuses, ...maritalStatuses])
            );
            return uniqueMaritalStatuses;
          });

          const gender = excelData
            .slice(1) // Skip the header row
            .map((row) => row[2].toLowerCase().trim()); // Convert to lowercase
          setGenderData((prevGenderData) => {
            const uniqueGenderData = Array.from(
              new Set([...prevGenderData, ...gender])
            );
            return uniqueGenderData;
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
        <Filter
          excelData={excelData}
          setExcelData={setExcelData}
          setCurrentPage={setCurrentPage}
          qualificationValues={qualificationValues}
          cityValues={cityValues}
          maritalStatusValues={maritalStatusValues}
          genderData={genderData}
        />
      )}
    </>
  );
};

export default Home;
