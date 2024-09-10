/* eslint-disable react/jsx-key */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import FemaleIcon from "@mui/icons-material/Female";
import MaleIcon from "@mui/icons-material/Male";
import { Box, Typography } from "@mui/material";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import emptySearch from "../../assets/EmptyState.svg";
import FemaleImg from "../../assets/FemaleIcon.jpg";
import MaleImg from "../../assets/MaleIcon.jpeg";
import backgoundImg from "../../assets/SearchPage.png";
import { convertToDateObject } from "../../utils";
import "./listing.css";

const Listing = () => {
  const navigate = useNavigate();
  const filteredData = useSelector((state) => state.filter.filteredData);

  useEffect(() => {
    document.body.style.background = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
    url(${backgoundImg}) no-repeat fixed`;
    window.scrollTo(0, 0);
  }, []);

  const getFormattedDate = (dateString) => {
    const dateObj = convertToDateObject(dateString);
    // Format the date
    const formattedDate = `${dateObj.getDate()} ${dateObj.toLocaleString(
      "default",
      { month: "short" }
    )}, ${dateObj.getFullYear()}`;
    return formattedDate;
  };

  return (
    <div className="MainListingPage">
      {filteredData?.length ? (
        <button
          className="btn-class-name"
          onClick={() => {
            navigate("/filter");
          }}
        >
          <span className="back"></span>
          <span className="front">
            Go
            <br />
            Back
          </span>
        </button>
      ) : (
        <></>
      )}

      {filteredData?.length ? (
        <>
          {filteredData?.map((obj, index) => {
            return (
              <div className="cardContainer">
                <div key={index} className="container">
                  <div className="card_box">
                    <span data-id={`ID: ${obj.id}`}></span>
                    <div className="card_grid_container">
                      <div className="left_side_card">
                        <img
                          src={obj.gender === "male" ? MaleImg : FemaleImg}
                          loading="fast"
                          alt=""
                          className="left_profile_avatar"
                        />
                        <Box>
                          <Typography
                            color={"#fff"}
                            fontFamily={"Public Sans"}
                            fontSize={"22px"}
                            textAlign="center"
                            fontWeight="bold"
                          >
                            {obj.name}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            gap: "20px",
                            paddingTop: "5px",
                          }}
                        >
                          <Typography
                            color={"#fff"}
                            fontFamily={"Public Sans"}
                            fontSize={"16px"}
                            textAlign="center"
                          >
                            {getFormattedDate(obj.dateOfBirth)}
                          </Typography>
                          <Typography
                            color={"#fff"}
                            fontFamily={"Public Sans"}
                            fontSize={"16px"}
                            textAlign="center"
                            display={"flex"}
                            alignItems="center"
                            gap="5px"
                          >
                            {obj.gender === "female" ? "Female" : "Male"}
                            {obj.gender === "female" ? (
                              <FemaleIcon
                                fontSize="small"
                                sx={{
                                  fill: "#FFB1CB",
                                }}
                              />
                            ) : (
                              <MaleIcon
                                fontSize="small"
                                sx={{
                                  fill: "#01A6EA",
                                }}
                              />
                            )}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            gap: "20px",
                            paddingTop: "5px",
                          }}
                        >
                          <Typography
                            color={"#fff"}
                            fontFamily={"Public Sans"}
                            fontSize={"16px"}
                            textAlign="center"
                          >
                            <p
                              style={{
                                display: "inline",
                                color: "#ffb144",
                              }}
                            >
                              Height:
                            </p>
                            {` ${obj.height || "--"}`}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            gap: "20px",
                            paddingTop: "5px",
                          }}
                        >
                          <Typography
                            color={"#fff"}
                            fontFamily={"Public Sans"}
                            fontSize={"16px"}
                            textAlign="center"
                            display={"flex"}
                            alignItems="center"
                            gap="5px"
                          >
                            <p
                              style={{
                                display: "inline",
                                color: "#ffb144",
                              }}
                            >
                              City:
                            </p>
                            {` ${
                              obj.cityVillage
                                ? obj.cityVillage?.charAt(0).toUpperCase() +
                                  obj.cityVillage.slice(1).toLowerCase()
                                : "--"
                            }`}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            gap: "20px",
                            paddingTop: "5px",
                          }}
                        >
                          <Typography
                            color={"#fff"}
                            fontFamily={"Public Sans"}
                            fontSize={"16px"}
                            textAlign="center"
                            display={"flex"}
                            alignItems="baseline"
                            gap="5px"
                          >
                            <p
                              style={{
                                display: "inline",
                                color: "#ffb144",
                              }}
                            >
                              Qualification:
                            </p>
                            {` ${
                              obj.qualification
                                ? obj.qualification.toUpperCase()
                                : "--"
                            }`}
                          </Typography>
                        </Box>
                      </div>
                      <div className="right_side_card">
                        <Box
                          sx={{
                            display: "flex",
                            gap: "20px",
                            paddingTop: "5px",
                          }}
                        >
                          <Typography
                            color={"#fff"}
                            fontFamily={"Public Sans"}
                            fontSize={"16px"}
                            display={"flex"}
                            alignItems="baseline"
                            gap="5px"
                            className="detail_tag"
                            sx={{
                              wordBreak: "break-all",
                            }}
                          >
                            <p
                              style={{
                                display: "inline",
                                color: "#ffb144",
                                minWidth: "160px",
                              }}
                            >
                              Contact:
                            </p>
                            {` ${obj.contactNumber || "--"}`}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            gap: "20px",
                            paddingTop: "5px",
                          }}
                        >
                          <Typography
                            color={"#fff"}
                            fontFamily={"Public Sans"}
                            fontSize={"16px"}
                            display={"flex"}
                            gap="5px"
                            className="detail_tag"
                          >
                            <p
                              style={{
                                display: "inline",
                                color: "#ffb144",
                                maxWidth: "160px",
                              }}
                            >
                              Weight/Other Information:
                            </p>
                            {` ${obj.weight || "--"}`}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            gap: "20px",
                            paddingTop: "5px",
                          }}
                        >
                          <Typography
                            color={"#fff"}
                            fontFamily={"Public Sans"}
                            fontSize={"16px"}
                            display={"flex"}
                            alignItems="baseline"
                            gap="5px"
                            className="detail_tag"
                          >
                            <p
                              style={{
                                display: "inline",
                                color: "#ffb144",
                                minWidth: "160px",
                              }}
                            >
                              Education:
                            </p>
                            {` ${obj.education || "--"}`}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            gap: "20px",
                            paddingTop: "5px",
                          }}
                        >
                          <Typography
                            color={"#fff"}
                            fontFamily={"Public Sans"}
                            fontSize={"16px"}
                            display={"flex"}
                            alignItems="baseline"
                            gap="5px"
                            className="detail_tag"
                          >
                            <p
                              style={{
                                display: "inline",
                                color: "#ffb144",
                                minWidth: "160px",
                              }}
                            >
                              Current Profile:
                            </p>
                            {` ${obj.currentProfile || "--"}`}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            gap: "20px",
                            paddingTop: "5px",
                          }}
                        >
                          <Typography
                            color={"#fff"}
                            fontFamily={"Public Sans"}
                            fontSize={"16px"}
                            display={"flex"}
                            alignItems="baseline"
                            gap="5px"
                            className="detail_tag"
                          >
                            <p
                              style={{
                                display: "inline",
                                color: "#ffb144",
                                minWidth: "160px",
                              }}
                            >
                              Marital Status:
                            </p>
                            {` ${
                              obj.maritalStatus
                                ? obj.maritalStatus?.charAt(0).toUpperCase() +
                                  obj.maritalStatus.slice(1).toLowerCase()
                                : "--"
                            }`}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            gap: "20px",
                            paddingTop: "5px",
                          }}
                        >
                          <Typography
                            color={"#fff"}
                            fontFamily={"Public Sans"}
                            fontSize={"16px"}
                            display={"flex"}
                            alignItems="baseline"
                            gap="5px"
                            className="detail_tag"
                          >
                            <p
                              style={{
                                display: "inline",
                                color: "#ffb144",
                                minWidth: "160px",
                              }}
                            >
                              Father's Name:
                            </p>
                            {` ${obj.fatherName || "--"}`}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            gap: "20px",
                            paddingTop: "5px",
                          }}
                        >
                          <Typography
                            color={"#fff"}
                            fontFamily={"Public Sans"}
                            fontSize={"16px"}
                            display={"flex"}
                            alignItems="baseline"
                            gap="5px"
                            className="detail_tag"
                          >
                            <p
                              style={{
                                display: "inline",
                                color: "#ffb144",
                                minWidth: "160px",
                              }}
                            >
                              Father's Occupation:
                            </p>
                            {` ${obj.fatherOccupation || "--"}`}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            gap: "20px",
                            paddingTop: "5px",
                          }}
                        >
                          <Typography
                            color={"#fff"}
                            fontFamily={"Public Sans"}
                            fontSize={"16px"}
                            display={"flex"}
                            alignItems="baseline"
                            gap="5px"
                            className="detail_tag"
                          >
                            <p
                              style={{
                                display: "inline",
                                color: "#ffb144",
                                minWidth: "160px",
                              }}
                            >
                              Mother's Name:
                            </p>
                            {` ${obj.motherName || "--"}`}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            gap: "20px",
                            paddingTop: "5px",
                          }}
                        >
                          <Typography
                            color={"#fff"}
                            fontFamily={"Public Sans"}
                            fontSize={"16px"}
                            display={"flex"}
                            alignItems="baseline"
                            gap="5px"
                            className="detail_tag"
                          >
                            <p
                              style={{
                                display: "inline",
                                color: "#ffb144",
                                minWidth: "160px",
                              }}
                            >
                              Sub-Cast:
                            </p>
                            {` ${obj.subCast || "--"}`}
                          </Typography>
                        </Box>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <>
          <Box className="no-data-wrapper">
            <Box className="no-data-inner-box">
              <img src={emptySearch} />
              <p className="no-results-text">No results found</p>
              <p className="no-result-sub-text">
                Try adjusting your filter <br />
                to find what you are looking for
              </p>
              <button
                onClick={() => {
                  navigate("/filter");
                }}
                className="filter-again-btn"
              >
                Filter again
              </button>
            </Box>
          </Box>
        </>
      )}
    </div>
  );
};

export default Listing;
