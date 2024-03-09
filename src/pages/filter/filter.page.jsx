/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import RishtaImage from "../../assets/samajRishta.png";
import samajLogo from "../../assets/SplashScreenLogo.png";
import { calculateAge } from "../../utils";
import "./filter.css";

// eslint-disable-next-line react/prop-types
const Filter = ({
  excelData,
  setExcelData,
  setCurrentPage,
  qualificationValues,
  cityValues,
  maritalStatusValues,
  genderData,
}) => {
  //color codes :

  // #1f4373
  // #2d83a6
  // #98BF45
  // #f28F16
  // #d90404

  const [fromAge, setFromAge] = useState("");
  const [toAge, setToAge] = useState("");
  const [fromAgeError, setFromAgeError] = useState({
    isError: false,
    message: "",
  });
  const [toAgeError, setToAgeError] = useState({
    isError: false,
    message: "",
  });
  const [qualification, setQualification] = useState("");
  const [city, setCity] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [gender, setGender] = useState("");
  // const [navBg, setNavBg] = useState(false);

  // const changeNavBg = () => {
  //   console.log(window.scrollY, "window.scrollY");
  //   window.scrollY >= 75 ? setNavBg(true) : setNavBg(false);
  // };

  // useEffect(() => {
  //   window.addEventListener("scroll", changeNavBg);
  //   return () => {
  //     window.removeEventListener("scroll", changeNavBg);
  //   };
  // }, []);

  // console.log(navBg, "navBg");

  const handleSubmit = () => {
    const filteredData = excelData.filter((data) => {
      // Filter by age
      const dobFromData = data.dateOfBirth.replaceAll("-", "/");

      const userAge = calculateAge(dobFromData);

      if (
        (fromAge && userAge < parseInt(fromAge)) ||
        (toAge && userAge > parseInt(toAge))
      ) {
        return false;
      }

      // Filter by other criteria
      return (
        (!qualification || data.qualification === qualification) &&
        (!gender || data.gender === gender) &&
        (!city || data.cityVillage === city) &&
        (!maritalStatus || data.maritalStatus === maritalStatus)
      );
    });
    setExcelData(filteredData);
    setCurrentPage("listing");
  };

  const handleFromAgeChange = (event) => {
    const value = event.target.value;
    const regex = /^[0-9]+$/;

    if (["e", "E", "-"].some((char) => value.includes(char))) {
      return;
    }

    if (regex.test(value) || !value) {
      setFromAge(event.target.value);
    }
    // Validate toAge against fromAge
    if (!value) {
      setFromAgeError({
        isError: false,
        message: "",
      });
      return;
    }
    if (value <= 0) {
      setFromAgeError({
        isError: true,
        message: "From age must be greater than 0",
      });
      return;
    } else {
      setFromAgeError({
        isError: false,
        message: "",
      });
    }
    if (value > 100) {
      setFromAgeError({
        isError: true,
        message: "From age must be less than 100",
      });
      return;
    } else {
      setFromAgeError({
        isError: false,
        message: "",
      });
    }

    if (value && toAge && Number(toAge) < Number(value)) {
      setToAgeError({
        isError: true,
        message: "To age cannot be less than From age",
      });
      return;
    } else {
      setToAgeError({
        isError: false,
        message: "",
      });
    }
  };

  const handleToAgeChange = (event) => {
    const value = event.target.value;
    const regex = /^[0-9]+$/;

    if (["e", "E", "-"].some((char) => value.includes(char))) {
      return;
    }

    if (regex.test(value) || !value) {
      setToAge(event.target.value);
    }
    // Validate against fromAge
    if (!value) {
      setToAgeError({
        isError: false,
        message: "",
      });
      return;
    }
    if (value <= 0) {
      setToAgeError({
        isError: true,
        message: "To age must be greater than 0",
      });
      return;
    } else {
      setToAgeError({
        isError: false,
        message: "",
      });
    }

    if (value > 100) {
      setToAgeError({
        isError: true,
        message: "To age must be less than 100",
      });
      return;
    } else {
      setToAgeError({
        isError: false,
        message: "",
      });
    }
    if (fromAge && value && Number(value) < Number(fromAge)) {
      setToAgeError({
        isError: true,
        message: "To age cannot be less than From age",
      });
      return;
    } else {
      setToAgeError({
        isError: false,
        message: "",
      });
    }
  };

  const handleChangeQualification = (event) => {
    setQualification(event.target.value);
  };

  const handleChangeCity = (event) => {
    setCity(event.target.value);
  };

  const handleChangeMaritalStatus = (event) => {
    setMaritalStatus(event.target.value);
  };

  const handleChangeGender = (event) => {
    setGender(event.target.value);
  };

  const socialTeam = [
    {
      name: "Salimbhai Vhora (Mahemdabad)",
      mobile: "94270 84786",
    },
    {
      name: "Salimbhai Vhora (Mahemdabad)",
      mobile: "94270 84786",
    },
    {
      name: "Salimbhai Vhora (Mahemdabad)",
      mobile: "94270 84786",
    },
    {
      name: "Salimbhai Vhora (Mahemdabad)",
      mobile: "94270 84786",
    },
    {
      name: "Salimbhai Vhora (Mahemdabad)",
      mobile: "94270 84786",
    },
  ];

  return (
    <div
      style={{
        // backgroundColor: "#f1ffd4",
        width: "100%",
      }}
    >
      <div
        style={{
          minHeight: "100vh",
          height: "100%",
          width: "100%",
          maxWidth: "1140px",
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* <div
          className="heart"
          style={{
            width: "59px",
            position: "absolute",
            top: "33px",
            left: "334px",
            transform: "rotate(-13deg)",
          }}
        ></div> */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            marginBlockEnd: "20px",
            background: "rgba(255, 255, 255, 0.25)",
            backdropFilter: "blur(10.5px)",
            webkitBackdropFilter: "blur(10.5px)",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            padding: "12px 24px",
            marginBlock: "40px",
            minWidth: "1000px",
            // position: "sticky",
            // top: "10px",
            zIndex: "10",
          }}
        >
          <img src={samajLogo} height={"110px"} width={"110px"} />
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography color={"#FFD700"} fontSize={"26px"} fontWeight={600}>
              ચરોતર સુન્ની વ્હોરા સુધારક મંડળ - 68 અટક
            </Typography>
            <Typography
              color={"#FFF"}
              fontSize={"22px"}
              fontWeight={600}
              textAlign={"center"}
              paddingTop={"8px"}
            >
              ૬૮ સમાજ રિશ્તા ગ્રુપ
            </Typography>
          </Box>
          <img
            src={RishtaImage}
            height={"100px"}
            width={"100px"}
            style={{ borderRadius: "50%" }}
          />
        </div>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "15px",
            marginBottom: "20px",
          }}
        >
          <Card
            className="filterCard"
            sx={{ padding: "25px", borderRadius: "15px" }}
          >
            <InputLabel sx={{ marginBottom: "4px" }}>Age:</InputLabel>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <TextField
                label="From Age"
                value={fromAge}
                onChange={handleFromAgeChange}
                margin="normal"
                fullWidth
                error={fromAgeError.isError}
                helperText={fromAgeError.message}
                sx={{
                  minHeight: "78px",
                }}
              />
              <TextField
                label="To Age"
                value={toAge}
                onChange={handleToAgeChange}
                margin="normal"
                fullWidth
                error={toAgeError.isError}
                helperText={toAgeError.message}
                sx={{ minHeight: "78px" }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <Box sx={{ width: "100%" }}>
                <InputLabel sx={{ marginBottom: "4px" }}>
                  Qualification:
                </InputLabel>
                <Box
                  sx={{ display: "flex", gap: "20px", marginBottom: "15px" }}
                >
                  <FormControl sx={{ width: "100%" }}>
                    <Select
                      value={qualification}
                      onChange={handleChangeQualification}
                      displayEmpty
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 200, // Set your desired max height here
                          },
                        },
                      }}
                    >
                      <MenuItem value={""}>
                        <p>All</p>
                      </MenuItem>
                      {qualificationValues.map((value) => (
                        <MenuItem key={value} value={value}>
                          {value.charAt(0).toUpperCase() +
                            value.slice(1).toLowerCase()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box sx={{ width: "100%" }}>
                <InputLabel sx={{ marginBottom: "4px" }}>City:</InputLabel>
                <Box
                  sx={{ display: "flex", gap: "20px", marginBottom: "15px" }}
                >
                  <FormControl sx={{ width: "100%" }}>
                    <Select
                      value={city}
                      onChange={handleChangeCity}
                      displayEmpty
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 200, // Set your desired max height here
                          },
                        },
                      }}
                    >
                      <MenuItem value={""}>
                        <p>All</p>
                      </MenuItem>
                      {cityValues.map((value) => (
                        <MenuItem key={value} value={value}>
                          {value.charAt(0).toUpperCase() +
                            value.slice(1).toLowerCase()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <Box sx={{ width: "100%" }}>
                <InputLabel sx={{ marginBottom: "4px" }}>
                  Marital Status:
                </InputLabel>
                <Box
                  sx={{ display: "flex", gap: "20px", marginBottom: "15px" }}
                >
                  <FormControl sx={{ width: "100%" }}>
                    <Select
                      value={maritalStatus}
                      onChange={handleChangeMaritalStatus}
                      displayEmpty
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 200, // Set your desired max height here
                          },
                        },
                      }}
                    >
                      <MenuItem value={""}>
                        <p>All</p>
                      </MenuItem>
                      {maritalStatusValues.map((value) => (
                        <MenuItem key={value} value={value}>
                          {value.charAt(0).toUpperCase() +
                            value.slice(1).toLowerCase()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box sx={{ width: "100%" }}>
                <InputLabel sx={{ marginBottom: "4px" }}>Gender:</InputLabel>
                <Box
                  sx={{ display: "flex", gap: "20px", marginBottom: "15px" }}
                >
                  <FormControl sx={{ width: "100%" }}>
                    <Select
                      value={gender}
                      onChange={handleChangeGender}
                      displayEmpty
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 200, // Set your desired max height here
                          },
                        },
                      }}
                    >
                      <MenuItem value={""}>
                        <p>All</p>
                      </MenuItem>
                      {genderData.map((value) => (
                        <MenuItem key={value} value={value}>
                          {value.charAt(0).toUpperCase() +
                            value.slice(1).toLowerCase()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                marginBlockStart: "10px",
              }}
            >
              <Button
                variant="contained"
                disabled={fromAgeError.isError || toAgeError.isError}
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Box>
          </Card>
        </Box>
        {/* <div className="OurTeamSectionDiv">
          <div className="OurTeamSectionDiv2">
            <div className="TeamHeading">
              <p>Rishta Team</p>
            </div>
            <div className="TeamContainer">
              <div className="Social_Team">
                <p className="SocialTeamHeading">Social Team</p>
                <div className="SocialTeamListingDiv">
                  <table>
                    <tr>
                      <td>Salimbhai Vhora (Mahemdabad)</td>
                      <td>
                        <span>- 94270 84786</span>
                      </td>
                    </tr>
                    <tr>
                      <td>Altafbhai Vhora (LIC)</td>
                      <td>
                        <span>- 94286 60790</span>
                      </td>
                    </tr>
                    <tr>
                      <td>Ilyasbhai Vhora (Chemical)</td>
                      <td>
                        <span>- 95746 68782</span>
                      </td>
                    </tr>
                    <tr>
                      <td>Idrishbhai Vhora (Mahudha)</td>
                      <td>
                        <span>- 98258 53404</span>
                      </td>
                    </tr>
                    <tr>
                      <td>Samirbhai Vhora (Boriyavi)</td>
                      <td>
                        <span>- 70162 88489</span>
                      </td>
                    </tr>
                    <tr>
                      <td>Mo.Shafibhai Vhora (Nadiad)</td>
                      <td>
                        <span>- 97231 13658</span>
                      </td>
                    </tr>
                    <tr>
                      <td>Dr.Sarfaraz Mansuri</td>
                      <td>
                        <span>- 99042 61740</span>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
              <div className="IT_Team">
                <p className="ITTeamHeading">IT Team</p>
                <div className="ITTeamListingDiv">
                  <table>
                    <tr>
                      <td>Mo.Shafibhai Vhora (Nadiad)</td>
                      <td>
                        <span>- 97231 13658</span>
                      </td>
                    </tr>
                    <tr>
                      <td>Dr.Sarfaraz Mansuri</td>
                      <td>
                        <span>- 99042 61740</span>
                      </td>
                    </tr>
                    <tr>
                      <td>Mo.Ayaz Salimbhai Vhora</td>
                    </tr>
                    <tr>
                      <td>Anas Salimbhai Vhora</td>
                    </tr>
                    <tr>
                      <td>Maaz Vhora</td>
                    </tr>
                    <tr>
                      <td>Faizal Vhora</td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div> */}
        <div className="container">
          <div id="out_team_wrapper">
            <div className="TeamHeading-container">
              <div className="TeamHeading">
                <div className="social_team">
                  <p className="team_label">Social Team</p>
                  <div className="team_details">
                    <p>
                      <span>Salimbhai Vhora (Mahemdabad)</span>
                      <span> 94270 84786</span>
                    </p>
                    <p>
                      <span>Altafbhai Vhora (LIC)</span>
                      <span> 94286 60790</span>
                    </p>
                    <p>
                      <span> Ilyasbhai Vhora (Chemical)</span>
                      <span> 95746 68782</span>
                    </p>
                    <p>
                      <span> Idrishbhai Vhora (Mahudha)</span>
                      <span> 98258 53404</span>
                    </p>
                    <p>
                      <span> Samirbhai Vhora (Boriyavi)</span>
                      <span> 70162 88489</span>
                    </p>
                    <p>
                      <span> Mo.Shafibhai Vhora (Nadiad)</span>
                      <span> 97231 13658</span>
                    </p>
                    <p>
                      <span> Dr.Sarfaraz Mansuri</span>
                      <span> 99042 61740</span>
                    </p>
                  </div>
                </div>
                <div className="IT_team">
                  <p className="team_label">IT Team</p>
                  <div className="team_details">
                    <p>
                      <span>Mo.Shafibhai Vhora (Nadiad)</span>
                      <span> 97231 13658</span>
                    </p>
                    <p>
                      <span>Dr.Sarfaraz Mansuri</span>
                      <span> 99042 61740</span>
                    </p>
                    <p>
                      <span>Mo.Ayaz Salimbhai Vhora</span>
                      <span> 79904 84682</span>
                    </p>
                    <p>
                      <span> Anas Salimbhai Vhora</span>
                      <span> 70413 17915</span>
                    </p>
                    <p>
                      <span> Maaz Vhora</span>
                      <span> </span>
                    </p>
                    <p>
                      <span> Faizal Vhora</span>
                      <span> </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="chief-details">
                <h1>Chief</h1>
                <p>
                  <span>Nurulhasan Vohra</span>
                  <span>98250 90992</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="OurTeam_Main_Div">
        <div className="OurTeam_text">
        <h1>Our Team</h1>
        </div>
        <div className="TeamCard">
        <div className="TeamCard_Img_Div">
        <img src={DevLogo} alt="" />
        </div>
          <div className="Text_And_InfoDiv">
            <p>Anas Vhora</p>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Filter;
