/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";

const Listing = ({ setCurrentPage, excelData }) => {
  const [dataObjects, setDataObjects] = useState([]);

  useEffect(() => {
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
      setDataObjects(processedData);
      console.log(dataObjects);
    }
  }, [excelData]);

  // Now, dataObjects contains an array of objects with key-value pairs

  return (
    <div>
      <h2>Listing Page</h2>
      <div>
        {dataObjects.map((obj, index) => (
          <div key={index}>{JSON.stringify(obj)}</div>
        ))}
      </div>
    </div>
  );
};

export default Listing;
