/* eslint-disable react/prop-types */
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import ITTeamIcon from "../../assets/ITteam.png";
import samajLogo from "../../assets/SplashScreenLogo.png";
import RishtaImage from "../../assets/samajRishta.png";
import socialTeamIcon from "../../assets/socialTeam.png";
import teamWorkIcon from "../../assets/teamwork.png";
import { setFilteredData } from "../../duck/slice";
import { calculateAge } from "../../utils";
import { qualificationLabels } from "../../utils/qualification";
import Loader from "../loader/loader.page";
import "./filter.css";

// eslint-disable-next-line react/prop-types
const Filter = () => {
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
  const [qualification, setQualification] = useState([]);
  const [city, setCity] = useState([]);
  const [maritalStatus, setMaritalStatus] = useState([]);
  const [gender, setGender] = useState("");

  const [excelData, setExcelData] = useState([]);
  const [cityValues, setCityValues] = useState([]);
  const [qualificationValues, setQualificationValues] = useState([]);
  const [maritalStatusValues, setMaritalStatusValues] = useState([]);
  const [loader, setLoader] = useState(true);
  const [isErrorFromApi, setIsErrorFromAPI] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const formattedQualificationValues = qualificationValues.map((value) => ({
    value,
    label: qualificationLabels[value] || value.toUpperCase(),
  }));

  useEffect(() => {
    const fetchData = async () => {
      setIsErrorFromAPI(false);
      try {
        setLoader(true);
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

          // Set the processed data in the state variable
          setExcelData(processedData);
        }

        setLoader(false);
      } catch (error) {
        setIsErrorFromAPI(true);
        setLoader(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = () => {
    const outputData = excelData.filter((data) => {
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
        (!qualification?.length ||
          qualification.includes(data.qualification)) &&
        (!gender || data.gender === gender) &&
        (!city?.length || city.includes(data.cityVillage)) &&
        (!maritalStatus?.length || maritalStatus.includes(data.maritalStatus))
      );
    });

    navigate("/userlist");

    dispatch(setFilteredData(outputData));
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

    if (toAge > 100) {
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
    const {
      target: { value },
    } = event;
    setQualification(typeof value === "string" ? value.split(",") : value);
  };

  const handleChangeCity = (event) => {
    const {
      target: { value },
    } = event;
    setCity(typeof value === "string" ? value.split(",") : value);
  };

  const handleChangeMaritalStatus = (event) => {
    const {
      target: { value },
    } = event;
    setMaritalStatus(typeof value === "string" ? value.split(",") : value);
  };

  const handleChangeGender = (event) => {
    setGender(event.target.value);
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  useEffect(() => {
    document.body.style.background = `#fff`;
  }, []);

  return (
    <div className="FilterPageMainDiv">
      {loader ? (
        <Loader />
      ) : (
        <div className="filter-page-container">
          <div className="navbar-container">
            <div className="navbar-wrapper">
              <div className="navbar-inner-wrapper">
                <div className="samaj-logo-bg">
                  <img src={samajLogo} className="samaj-logo" />
                </div>
                <Box className="nav-title-text">
                  <Typography className="nav-title-main-text">
                    ચરોતર સુન્ની વ્હોરા સુધારક મંડળ - 68 અટક
                  </Typography>
                  <Typography className="nav-title-sub-text">
                    ૬૮ સમાજ રિશ્તા ગ્રુપ
                  </Typography>
                </Box>
                <div className="rishta-group-logo">
                  <img src={RishtaImage} className="rishta-group" />
                </div>
              </div>
            </div>
          </div>

          {isErrorFromApi && (
            <div className="container alert-msg">
              <Alert variant="filled" severity="error">
                Oops, something went wrong, please try again later.
              </Alert>
            </div>
          )}
          <div className="filter-box-wrapper container">
            <div id="filter-box-wrapper">
              <div className="filter-box-container">
                <div className="filter-options-container">
                  <div>
                    <label className="filter-label">Age:</label>
                    <div className="age-filter-input-wraper">
                      <TextField
                        value={fromAge}
                        onChange={handleFromAgeChange}
                        variant="standard"
                        placeholder="From"
                        inputProps={{
                          maxLength: 3,
                        }}
                        sx={{
                          "& .MuiInputBase-root.MuiInput-root:hover::before": {
                            border: "none",
                          },
                          "& .MuiInputBase-root.MuiInput-root::before": {
                            border: "none",
                          },
                          "& .MuiInputBase-root.MuiInput-root::after": {
                            border: "none",
                          },
                        }}
                        className="age-input-field"
                      />
                      <span> - </span>
                      <TextField
                        value={toAge}
                        onChange={handleToAgeChange}
                        variant="standard"
                        placeholder="To"
                        inputProps={{
                          maxLength: 3,
                        }}
                        sx={{
                          "& .MuiInputBase-root.MuiInput-root:hover::before": {
                            border: "none",
                          },
                          "& .MuiInputBase-root.MuiInput-root::before": {
                            border: "none",
                          },
                          "& .MuiInputBase-root.MuiInput-root::after": {
                            border: "none",
                          },
                        }}
                        className="age-input-field"
                      />
                    </div>
                    <p className="age-input-error-msg">
                      {fromAgeError.isError
                        ? fromAgeError.message
                        : toAgeError.isError
                        ? toAgeError.message
                        : ""}
                    </p>
                  </div>

                  <div>
                    <label className="filter-label">Gender:</label>
                    <RadioGroup
                      row
                      value={gender}
                      onChange={handleChangeGender}
                      className="gender-radio-group"
                    >
                      <FormControlLabel
                        value=""
                        control={<Radio />}
                        label="All"
                      />
                      <FormControlLabel
                        value="female"
                        control={<Radio />}
                        label="Female"
                      />
                      <FormControlLabel
                        value="male"
                        control={<Radio />}
                        label="Male"
                      />
                    </RadioGroup>
                  </div>

                  <div></div>
                  <div className="qualification-wrapper">
                    <label className="filter-label">Qualification:</label>
                    <Select
                      multiple
                      value={qualification}
                      onChange={handleChangeQualification}
                      input={<OutlinedInput />}
                      displayEmpty
                      IconComponent={ExpandMoreIcon}
                      renderValue={(selected) => {
                        if (selected?.length) {
                          return selected
                            .map(
                              (value) =>
                                qualificationLabels[value] ||
                                value.toUpperCase()
                            )
                            .join(", ");
                        }
                        return "All";
                      }}
                      MenuProps={MenuProps}
                      className="select-dropdown-common"
                      sx={{
                        "& fieldset": {
                          border: "1px solid #d3d3d3",
                        },
                        "& .MuiSvgIcon-root": { color: "rgb(174, 0, 61)" },
                      }}
                    >
                      {formattedQualificationValues.map((qualificationObj) => (
                        <MenuItem
                          key={qualificationObj.value}
                          value={qualificationObj.value}
                        >
                          <Checkbox
                            checked={
                              qualification.indexOf(qualificationObj.value) > -1
                            }
                          />
                          <ListItemText primary={qualificationObj.label} />
                        </MenuItem>
                      ))}
                    </Select>
                  </div>

                  <div className="city-wrapper">
                    <label className="filter-label">City:</label>
                    <Select
                      multiple
                      value={city}
                      onChange={handleChangeCity}
                      input={<OutlinedInput />}
                      displayEmpty
                      IconComponent={ExpandMoreIcon}
                      renderValue={(selected) => {
                        if (selected?.length) {
                          return selected.join(", ");
                        }
                        return "All";
                      }}
                      MenuProps={MenuProps}
                      className="select-dropdown-common"
                      sx={{
                        "& fieldset": {
                          border: "1px solid #d3d3d3",
                        },
                        "& .MuiSvgIcon-root": { color: "rgb(174, 0, 61)" },
                      }}
                    >
                      {cityValues.map((value) => (
                        <MenuItem key={value} value={value}>
                          <Checkbox checked={city.indexOf(value) > -1} />
                          <ListItemText
                            primary={
                              value.charAt(0).toUpperCase() +
                              value.slice(1).toLowerCase()
                            }
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </div>

                  <div className="marital-wrapper">
                    <label className="filter-label">Marital Status:</label>
                    <Select
                      multiple
                      value={maritalStatus}
                      onChange={handleChangeMaritalStatus}
                      input={<OutlinedInput />}
                      displayEmpty
                      IconComponent={ExpandMoreIcon}
                      renderValue={(selected) => {
                        if (selected?.length) {
                          return selected.join(", ");
                        }
                        return "All";
                      }}
                      MenuProps={MenuProps}
                      className="select-dropdown-common"
                      sx={{
                        "& fieldset": {
                          border: "1px solid #d3d3d3",
                        },
                        "& .MuiSvgIcon-root": { color: "rgb(174, 0, 61)" },
                      }}
                    >
                      {maritalStatusValues.map((value) => (
                        <MenuItem key={value} value={value}>
                          <Checkbox
                            checked={maritalStatus.indexOf(value) > -1}
                          />
                          <ListItemText
                            primary={
                              value.charAt(0).toUpperCase() +
                              value.slice(1).toLowerCase()
                            }
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>

                <p className="submit-notice-msg">
                  please wait 3 - 5 seconds for your request to be processed
                  after submitting.
                </p>
                <Box className="submit-btn-box">
                  <Button
                    variant="contained"
                    disabled={
                      fromAgeError.isError ||
                      toAgeError.isError ||
                      isErrorFromApi
                    }
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                </Box>
              </div>
            </div>
          </div>
          <div className="our_team_wrapper container">
            <div id="our_team_wrapper">
              <div className="TeamHeading-container">
                <div className="chief-details">
                  <div className="chief-wrapper">
                    <h1>Chief</h1>
                    <img src={teamWorkIcon} className="chief-img" />
                  </div>
                  <p>
                    <span>Nurulhasan Vohra</span>
                    <span>98250 90992</span>
                  </p>
                </div>
                <div className="TeamHeading">
                  <div className="social_team">
                    <div className="team-label-wrapper">
                      <p className="team_label">Social Team</p>
                      <img src={socialTeamIcon} className="social-team-img" />
                    </div>
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
                        <span> 73833 44881</span>
                      </p>
                      <p>
                        <span> Haji Ismailbhai Vhora (Dabhan)</span>
                        <span> 97237 86001</span>
                      </p>
                    </div>
                  </div>
                  <div className="IT_team">
                    <div className="team-label-wrapper">
                      <p className="team_label">IT Team</p>
                      <img src={ITTeamIcon} className="it-team-img" />
                    </div>
                    <div className="team_details">
                      <p>
                        <span>Mo.Shafibhai Vhora (Nadiad)</span>
                        <span> 97231 13658</span>
                      </p>
                      <p>
                        <span>Dr.Sarfaraz Mansuri</span>
                        <span> 73833 44881 </span>
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
