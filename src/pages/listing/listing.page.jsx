/* eslint-disable react/prop-types */
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Grid from "@mui/joy/Grid";
import Typography from "@mui/joy/Typography";
import FemaleIcon from "../../assets/FemaleIcon.jpg";
import MaleIcon from "../../assets/MaleIcon.jpg";
import "./listing.css";

const Listing = ({ excelData }) => {
  return (
    <div className="MainListingPage">
      <h2>Listing Page</h2>
      <div
        className="cardContainer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* <Grid container spacing={2} width="100%"> */}
        {excelData.map((obj, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              className="CardMainContainer"
              orientation="horizontal"
              sx={{
                minHeight: "45vh",
                Width: "10em",
                display: "flex",
                flexDirection: "row",
              }}
            >
              <CardContent sx={{ display: "flex", flexDirection: "row" }}>
                <div style={{ maxWidth: "200px" }}>
                  <img
                    src={obj.gender === "Male" ? MaleIcon : FemaleIcon}
                    srcSet={
                      obj.gender === "Male" ? `${MaleIcon}` : `${FemaleIcon}`
                    }
                    loading="fast"
                    alt=""
                    style={{
                      borderRadius: "50%",
                      maxHeight: "15vh",
                      maxWidth: "7.5vw",
                    }}
                  />
                  <Typography
                    fontSize="xl"
                    fontWeight="lg"
                    textAlign="center"
                    maxWidth={"10vw"}
                  >
                    {obj.name}
                  </Typography>
                  <Typography
                    level="body-sm"
                    fontWeight="lg"
                    textColor="text.tertiary"
                  >
                    <strong>
                      Gender: <br />
                    </strong>
                    {obj.gender}
                  </Typography>
                  <Typography
                    fontSize={"14px"}
                    level="body-sm"
                    fontWeight="lg"
                    textColor="text.tertiary"
                  >
                    <strong>
                      Qualification: <br />
                    </strong>
                    {obj.qualification}
                  </Typography>
                  <Typography
                    level="body-sm"
                    fontWeight="lg"
                    textColor="text.tertiary"
                  >
                    <strong>
                      Education: <br />
                    </strong>
                    {obj.education}
                  </Typography>
                  <Typography
                    level="body-sm"
                    fontWeight="lg"
                    textColor="text.tertiary"
                  >
                    <strong>
                      Date Of Birth: <br />
                    </strong>
                    {obj.dateOfBirth}
                  </Typography>
                  <Typography
                    level="body-sm"
                    fontWeight="lg"
                    textColor="text.tertiary"
                  >
                    <strong>
                      Height: <br />
                    </strong>
                    {obj.height}
                  </Typography>
                  <Typography
                    level="body-sm"
                    fontWeight="lg"
                    textColor="text.tertiary"
                  >
                    <strong>
                      Weight: <br />
                    </strong>
                    {obj.weight}
                  </Typography>
                </div>
                <hr />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto auto",
                    gap: "10px",
                  }}
                >
                  <Typography level="body-xs" fontWeight="lg" maxWidth="10vw">
                    <strong>ID No. :</strong> {obj.id}
                  </Typography>
                  <Typography level="body-xs" fontWeight="lg" maxWidth="10vw">
                    <strong>Father's Name:</strong> {obj.fatherName}
                  </Typography>
                  <Typography level="body-xs" fontWeight="lg" maxWidth="10vw">
                    <strong>Father's Occupation:</strong> {obj.fatherOccupation}
                  </Typography>
                  <Typography level="body-xs" fontWeight="lg" maxWidth="10vw">
                    <strong>Mother's Name:</strong> {obj.motherName}
                  </Typography>
                  <Typography level="body-xs" fontWeight="lg" maxWidth="10vw">
                    <strong>Current Profile:</strong> {obj.currentProfile}
                  </Typography>
                  <Typography level="body-xs" fontWeight="lg" maxWidth="10vw">
                    <strong>Marital Status:</strong> {obj.maritalStatus}
                  </Typography>
                  <Typography level="body-xs" fontWeight="lg" maxWidth="10vw">
                    <strong>Contact Number:</strong> {obj.contactNumber}
                  </Typography>
                  <Typography level="body-xs" fontWeight="lg" maxWidth="10vw">
                    <strong>68 Sub Cast:</strong> {obj.subCast}
                  </Typography>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {/* </Grid> */}
      </div>
    </div>
  );
};

export default Listing;
