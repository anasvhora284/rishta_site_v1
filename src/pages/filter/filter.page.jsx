// eslint-disable-next-line react/prop-types
const Filter = ({ setCurrentPage }) => {
  const handleSubmit = () => {
    setCurrentPage("listing");
  };

  return (
    <div>
      filter.page
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default Filter;
