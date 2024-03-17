const Loader = () => {
  return (
    <>
      <div
        className="LoaderMainClass"
        style={{
          backgroundColor: "#fff",
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="cssload-main">
          <div className="cssload-heart">
            <span className="cssload-heartL"></span>
            <span className="cssload-heartR"></span>
            <span className="cssload-square"></span>
          </div>
          <div className="cssload-shadow"></div>
        </div>

        <div className="typewriter">
          <p>Welcome to Rishta Group.</p>
        </div>
      </div>
    </>
  );
};

export default Loader;
