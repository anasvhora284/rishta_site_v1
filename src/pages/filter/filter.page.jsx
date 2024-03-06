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
import { useState } from "react";
import samajLogo from "../../assets/SplashScreenLogo.png";
import samajRishta from "../../assets/samajRishta.png";
import { calculateAge } from "../../utils";
import "./filter.css";
import DevLogo from "../../assets/DevLogo.jpg";

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
  return (
    <div>
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
            justifyContent: "center",
            alignItems: "center",
            gap: "16px",
            marginBlockEnd: "20px",
            background: "rgba(255, 255, 255, 0.25)",
            backdropFilter: "blur(1.5px)",
            webkitBackdropFilter: "blur(10.5px)",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            padding: "12px 40px",
          }}
        >
          <img src={samajLogo} height={"110px"} width={"110px"} />
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography color={"#FFD700"} fontSize={"20px"} fontWeight={600}>
              ચરોતર સુન્ની વ્હોરા સુધારક મંડળ - 68 અટક
            </Typography>
            <Typography
              color={"#FFF"}
              fontSize={"20px"}
              fontWeight={600}
              textAlign={"center"}
            >
              Rishta Group
            </Typography>
          </Box>
          <img src={samajRishta} height={"100px"} width={"100px"} />
        </div>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Card sx={{ padding: "25px" }}>
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
