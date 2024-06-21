import { useSelector } from "react-redux";

import classes from "./about.module.css";
import Tooltip from "../common/Tooltip/tooltip.jsx";
import myImage from "@/assets/images/me.png";
import Icon from "../common/Icon/icon.jsx";
import FeedButton from "../common/FeedButton/feed-button.jsx";
import { router } from "@/router";

const About = () => {
  const contact = useSelector((state) => state.contact);

  return (
    <div className={classes.About}>
      <h4>
        Over the past 5 years, I have been involved in a few different projects
        ranging from Risk Management, Automation, Regulatory Compliance, to
        DevOps.
      </h4>
      <h4>
        Across various domains, developing front-end & back-end systems,
        productivity tools, Infrastructure-as-Code and pipelines.
      </h4>
      {<img className={classes.Me} alt="Me" src={myImage} />}
      <a className={classes.Email} href={"mailto:" + contact.email}>
        <Tooltip customStyle={{ marginRight: ".5rem" }} tip="E-mail">
          <Icon name="email" size={1.5} />
        </Tooltip>
        {contact.email}
      </a>
      <div className={classes.Platforms}>
        {contact.platforms &&
          contact.platforms.map((platform) => (
            <a
              className={classes.PlatformLink}
              target="_blank"
              rel="noreferrer"
              key={platform.name}
              href={platform.link}
            >
              <Tooltip tip={platform.name}>
                <Icon name={platform.name.toLowerCase()} size={1.5} />
              </Tooltip>
            </a>
          ))}
      </div>
      <FeedButton
        customStyle={{ alignSelf: "unset", marginTop: "1rem" }}
        icon="resume"
        onClick={() => router.navigate("/resume")}
      >
        {"Résumé"}
      </FeedButton>
      <span>
        <Icon name="pin" size={1} />
        Amsterdam, Nederlands
      </span>
      <div className={classes.Copyright}>
        &copy;&nbsp;{new Date().getFullYear()}&nbsp;Saurabh Bhagat
      </div>
    </div>
  );
};

export default About;
