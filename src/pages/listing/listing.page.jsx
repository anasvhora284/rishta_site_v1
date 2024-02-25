/* eslint-disable react/prop-types */
const Listing = ({ excelData }) => {
  // Now, dataObjects contains an array of objects with key-value pairs

  return (
    <div>
      <h2>Listing Page</h2>
      <div>
        {excelData.map((obj, index) => (
          <div key={index}>{JSON.stringify(obj)}</div>
        ))}
      </div>
    </div>
  );
};

export default Listing;
