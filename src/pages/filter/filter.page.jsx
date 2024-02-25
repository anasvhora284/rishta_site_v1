import { Button } from "@mui/material";

// eslint-disable-next-line react/prop-types
const Filter = ({ setCurrentPage }) => {
  //color codes :

  // #1f4373
  // #2d83a6
  // #98BF45
  // #f28F16
  // #d90404

  const handleSubmit = () => {
    setCurrentPage("listing");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        height: "100%",
        width: "100%",
        backgroundColor: "#FCF5ED",
      }}
    >
      <Button variant="contained" onClick={handleSubmit}>
        Submit
      </Button>
    </div>
  );
};

export default Filter;
